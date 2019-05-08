class ProcessFeed {
    constructor(news, inputList) {
        this.news = news;
        this.inputList = inputList;
    }

    encode() {
        var inputArr = [], nonConceptCount = 0, prevInputEndIndex = 0, output = '';
        this.inputList
            .sort(
                (a, b) =>
                    a.startindex > b.startindex ? 1 : b.startindex > a.startindex ? -1 : 0
            )
            .forEach((input, index) => {
                var element = {};
                // BEGIN: Add concept : example - Obama 
                if (input.startindex === nonConceptCount && input.endIndex <= this.news.length) {
                    inputArr = this.addConcept(input, element, inputArr)
                // END: Add concept : example - Obama   
                } else {
                    // BEGIN: Add texts that are not part of the input list - visited, headquarters  
                    // example - current input 14-22, previous input end index 5, 1st add 6-13 addOthers()
                    // then 14 -22 addConcept()
                        nonConceptCount =  input.startindex - prevInputEndIndex;
                        inputArr = this.addOthers(input, element, prevInputEndIndex, inputArr)
                        element = {};
                    // END: Add texts that are not part of the input list - visited, headquarters  
                    
                    // BEGIN: Add concept that comes after a non concept: example - Facebook 
                    if (input.endIndex <= this.news.length) {
                        inputArr = this.addConcept(input, element, inputArr);
                    }
                    // END: Add concept that comes after a non concept: example - Facebook
                }
                nonConceptCount = input.endIndex + 1;
                prevInputEndIndex = input.endIndex;
            });
           
        inputArr.map((element, index) => {
            if (element.func && element.func.encode) {
                element.func.encode(element);
            }
            output += element.content;
        });
        return output;
    }

    addConcept(input, element, inputArr) {
        element.content = this.news.substring(
            input.startindex,
            input.endIndex+1
        );
        element.func = input;
        inputArr.push(element);
        return inputArr;
    }

    addOthers(input, element, prevInputEndIndex, inputArr) {
        element.content = this.news.substring(
            prevInputEndIndex + 1,
            input.startindex
        );
        inputArr.push(element);
        return inputArr;
    }
}

class ProcessConcept {
    constructor(content, startindex, endIndex) {
        this.content = content;
        this.startindex = startindex;
        this.endIndex = endIndex;
    }
    encode(news, index) {
        // takes extracted concepts from the feed and applies marker encode to that concept
        // i/p => “Obama”
        // o/p => "<strong>Obama</strong>"
        let result = this.content.encode(news.content);
        news.content = result;
        return news;
    }
}

class Marker {
    constructor(type, formatterFunc) {
        this.type = type;
        this.formatterFunc = formatterFunc;
    }
    encode(str) {
        let formattedTxt = this.formatterFunc(str);
        return formattedTxt;
    }
}

var entity = new Marker('entity', str => `<strong>${str}</strong> `);
var twitterUsername = new Marker(
    'twitterUsername',
    str => `<a href=http://twitter.com/${str}>${str}</a> `
);
var link = new Marker('link', str => `<a href=${str}>${str}</a> `);
var para = new Marker('para', str => `<p>${str}</p> `);

var input1 = new ProcessConcept(entity, 14, 22);
var input2 = new ProcessConcept(entity, 0, 5);
var input3 = new ProcessConcept(twitterUsername, 55, 67);
var input4 = new ProcessConcept(link, 37, 54);
var input5 = new ProcessConcept(para, 68, 84);


var inputs = [input1, input2, input3, input4, input5];
var t = new ProcessFeed(
    'Obama visited Facebook headquarters: http://bit.ly/xyz @elversatile my name is arjita',
    inputs
);
console.log(t.encode());
