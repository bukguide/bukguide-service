const successCode = (data, message) => {
    return {
        statusCode: 200,
        content: {
            data,
            message: message
        }
    }
}

const failCode = (message) => {
    return {
        statusCode: 400,
        content: message
    }
}

const errorCode = (message) => {
    return {
        statusCode: 500,
        content: message
    }
}

const successGetPage = (data, pageCurrent, pageSize, countTotalData) => {
    return {
        statusCode: 200,
        content: {
            data,
            pageCurrent,
            pageSize,
            totalPages: Math.ceil(countTotalData / pageSize),
            totalData: countTotalData,
        }
    }
}

export { successCode, failCode, errorCode, successGetPage }
