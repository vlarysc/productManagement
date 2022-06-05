'use strict';
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const params = {
  TableName: process.env.MY_SECRET,
}

module.exports.getProducts = async (event) => {
  try {
    let data = await dynamoDb.scan(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    }
  } catch (err) {
    console.log("Error", err);
    return {
      statusCode: err.statusCode ? err.statusCode : 500,
      body: JSON.stringify({
        error: err.name ? err.name : "Exception",
        message: err.message ? err.message : "Unknown Error"
      }),
    };
  }
};

module.exports.getProductsById = async (event) => {

  try {
    const { productId } = event.pathParameters;
    const data = await dynamoDb.get({
      ...params,
      Key: {
        id: productId
      }
    }).promise()

    if (!data.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Produto não existe' }, null, 2)
      }
    }

    const product = data.Item;

    return {
      statusCode: 200,
      body: JSON.stringify(product, null, 2)
    }

  } catch (err) {
    console.log("Error: ", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.name ? err.name : "Exception",
        message: err.message ? err.message : "Unknown Error"
      })
    }
  }
};

module.exports.putProduct = async (event) => {
  const { productId } = event.pathParameters;
  try {
    let dados = JSON.parse(event.body);
    const { category, amount, price, productName } = dados;

    await dynamoDb.update({
      ...params,
      Key: {
        id: productId
      },
      UpdateExpression:
        'SET productName = :productName, category = :category, amount = :amount, price = :price,'
        + ' updatedAtt = :updatedAtt',
      ConditionExpression: 'attribute_exists(id)',
      ExpressionAttributeValues: {
        ':productName': productName,
        ':category': category,
        ':amount': amount,
        ':price': price,
        ':updatedAtt': new Date().getTime(),
      }
    }).promise()

    return {
      statusCode: 204,
    }
  } catch (err) {
    console.log("Error: ", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.name ? err.name : "Exception",
        message: err.message ? err.message : "Unknown Error"
      })
    }
  }

};

module.exports.postProduct = async (event) => {
  try {
    let dados = JSON.parse(event.body);
    const { category, amount, price, productName } = dados;
    const product = {
      id: uuidv4(),
      category,
      amount,
      price,
      productName,
      createdAtt: new Date().getTime(),
      updatedAtt: new Date().getTime()
    }

    await dynamoDb.put({
      ...params,
      Item: product,
    }).promise()

    return {
      statusCode: 201,
    }
  } catch (err) {
    console.log("Error: ", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.name ? err.name : "Exception",
        message: err.message ? err.message : "Unknown Error"
      })
    }
  }
};

module.exports.deleteProduct = async (event) => {
  const { productId } = event.pathParameters;

  try {
    await dynamoDb.delete({
      ...params,
      Key: {
        id: productId
      },
      ConditionExpression: 'attribute_exists(id)'
    }).promise()

    return {
      statusCode: 204
    }

  } catch (err) {
    console.log("Error: ", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.name ? err.name : "Exception",
        message: err.message ? err.message : "Unknown Error"
      })
    }
  }

};

