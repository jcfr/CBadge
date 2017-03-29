module.exports = {
    "extends": "airbnb-base",
    "parserOptions": {
        "sourceType": "script"
    },
    "plugins": [
        "import"
    ],
    "rules": {
        "no-plusplus": [2, { "allowForLoopAfterthoughts": true }],
        "no-restricted-properties": 0,
    }
};