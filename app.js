function login(user, password) {
    if (password == "123456") {
        console.log("Login successful");
    }
}

const userInput = "SELECT * FROM users WHERE name = '" + user + "'";
eval(userInput);
