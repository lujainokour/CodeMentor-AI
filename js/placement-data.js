window.placementQuestions = [
    {
        topic: "Variables and data types",
        title: "What is the type of this value?",
        code: 'name = "Lujain"',
        options: ["int", "str", "float", "bool"],
        correct: 1
    },
    {
        topic: "Variables and data types",
        title: "What does this code print?",
        code: "x = 3\nx = 7\nprint(x)",
        options: ["3", "7", "10", "An error"],
        correct: 1
    },
    {
        topic: "Variables and data types",
        title: "What does this code print?",
        code: "print(2 + 3 * 4)",
        options: ["20", "14", "24", "9"],
        correct: 1
    },
    {
        topic: "Variables and data types",
        title: "What is the type returned by input()?",
        code: 'age = input("Enter your age: ")',
        options: ["int", "float", "str", "bool"],
        correct: 2
    },
    {
        topic: "Conditions and logic",
        title: "What does this code print?",
        code: 'score = 70\nif score >= 70:\n    print("Passed")\nelse:\n    print("Try again")',
        options: ["Passed", "Try again", "Both messages", "Nothing"],
        correct: 0
    },
    {
        topic: "Conditions and logic",
        title: "What does this expression evaluate to?",
        code: "True and False",
        options: ["True", "False", "None", "An error"],
        correct: 1
    },
    {
        topic: "Loops and iteration",
        title: "Which values does this loop print?",
        code: "for number in range(1, 4):\n    print(number)",
        options: ["1, 2, 3", "1, 2, 3, 4", "0, 1, 2, 3", "4"],
        correct: 0
    },
    {
        topic: "Loops and iteration",
        title: "What is the final printed value?",
        code: "total = 0\nfor number in [1, 2, 3]:\n    total += number\nprint(total)",
        options: ["3", "5", "6", "0"],
        correct: 2
    },
    {
        topic: "Functions and code reading",
        title: "What does this code print?",
        code: "def double(number):\n    return number * 2\n\nprint(double(4))",
        options: ["4", "6", "8", "An error"],
        correct: 2
    },
    {
        topic: "Functions and code reading",
        title: "What does this code print?",
        code: 'def greet(name):\n    return "Hello, " + name\n\nprint(greet("Lujain"))',
        options: [
            "Hello, name",
            "Hello, Lujain",
            "greet",
            "Nothing"
        ],
        correct: 1
    }
];