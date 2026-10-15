window.pythonLessons = [
    {
        id: "variables",
        title: "Variables and values",
        minutes: 10,
        intro: "Learn how a name refers to a value and how that value can change.",
        conceptTitle: "Give a value a name.",
        paragraphs: [
            "A variable is a name that refers to a value in your program.",
            "Use the equals sign (=) to assign a value. Choose names that describe the data.",
            "Assigning another value to the same name changes what that name refers to."
        ],
        code: 'name = "Lujain"\nprint(name)\n\nname = "Loji"\nprint(name)',
        output: "Lujain\nLoji",
        question: "What does the second print(name) display?",
        options: ["Lujain", "Loji", "name"],
        correct: 1,
        explanation: 'The second assignment makes name refer to "Loji".'
    },
    {
        id: "data-types",
        title: "Data types",
        minutes: 10,
        intro: "Recognize the types of common Python values.",
        conceptTitle: "Different values, different types.",
        paragraphs: [
            "Python values have types. Text uses str, whole numbers use int, and decimal numbers commonly use float.",
            "The bool type has two values: True and False.",
            "Use type() to inspect the type of a value."
        ],
        code: 'name = "Lujain"\nage = 21\nheight = 1.64\nis_learning = True\n\nprint(type(age))\nprint(type(is_learning))',
        output: "<class 'int'>\n<class 'bool'>",
        question: "Which value has the type bool?",
        options: ['"True"', "21", "True"],
        correct: 2,
        explanation: 'True without quotation marks is a boolean. "True" is a string.'
    },
    {
        id: "input-output",
        title: "Input and output",
        minutes: 10,
        intro: "Read a value from the user and display a useful message.",
        conceptTitle: "Let your program communicate.",
        paragraphs: [
            "input() reads a line of text and returns it as a string.",
            "print() displays values. An f-string lets you insert a value inside text using braces.",
            "The example below assumes the user enters Lujain."
        ],
        code: 'name = input()\nprint(f"Hello, {name}!")',
        output: "Hello, Lujain!",
        question: "What type does input() return?",
        options: ["str", "int", "bool"],
        correct: 0,
        explanation: "input() returns a string, even when the user enters digits."
    },
    {
        id: "numbers",
        title: "Working with numbers",
        minutes: 15,
        intro: "Convert numeric input and calculate a result.",
        conceptTitle: "Turn input into a calculation.",
        paragraphs: [
            "Convert numeric text using int() for whole numbers or float() for decimal numbers.",
            "Use +, -, * and / for arithmetic. Converting text that is not a valid number raises an error.",
            "This example uses a price of 2.5 and a quantity of 3. The .2f format displays two decimal places."
        ],
        code: 'price = float(input())\nquantity = int(input())\ntotal = price * quantity\n\nprint(f"Total: {total:.2f}")',
        output: "Total: 7.50",
        question: 'What is the result of int("3") * 2?',
        options: ['"33"', "6", "An error"],
        correct: 1,
        explanation: 'int("3") converts the text to the integer 3, and 3 * 2 is 6.'
    }
];

/* Curated external references for Level 01 lessons. No storage writes. */
(() => {
    const video = (title, id, language = "Arabic") => ({ title, url: `https://www.youtube.com/watch?v=${id}`, type: "Video", language });
    const docs = (title, path) => ({ title: `Python documentation: ${title}`, url: `https://docs.python.org/3/${path}`, type: "Documentation", language: "English" });
    const formatting = () => docs("Formatted string literals", "tutorial/inputoutput.html#formatted-string-literals");
    window.pythonLessonSources = {
        variables: [
            video("Elzero: Variables Part One", "hQnZxqp3Q0Y"),
            docs("Numbers and variable assignment", "tutorial/introduction.html#numbers")
        ],
        "data-types": [
            video("Elzero: Some Data Types Overviews", "43lT7k0Zws0"),
            docs("Built-in types", "library/stdtypes.html"),
            docs("type()", "library/functions.html#type")
        ],
        "input-output": [
            video("DigiTech Academy: Input() and Print()", "9h5Y7GpR9Oo", "Arabic (Darija)"),
            docs("input()", "library/functions.html#input"),
            docs("print()", "library/functions.html#print"),
            formatting()
        ],
        numbers: [
            video("Elzero: Numbers", "x7fFnKVAzDI"),
            video("Elzero: Arithmetic Operators", "prv7cVm2dxE"),
            docs("Numbers and arithmetic", "tutorial/introduction.html#numbers"),
            docs("int()", "library/functions.html#int"),
            docs("float()", "library/functions.html#float"),
            formatting()
        ]
    };
})();


