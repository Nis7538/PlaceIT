class customAPIError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

const createCustomAPIError = (msg, statusCode) => {
    return new customAPIError(msg, statusCode);
};

module.exports = createCustomAPIError;
