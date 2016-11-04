module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "plugins": ["react", "import"],
    "extends": ["airbnb", "plugin:import/errors", "plugin:import/warnings"],
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "sourceType": "module"
    },
    "rules": {
        "comma-dangle": ["error", "never"],
        "no-underscore-dangle": 0 // off
    }
};