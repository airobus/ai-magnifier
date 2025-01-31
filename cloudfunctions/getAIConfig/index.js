const cloud = require('wx-server-sdk')
cloud.init()

exports.main = async (event, context) => {
  return {
    accountId: process.env.CF_ACCOUNT_ID,
    apiToken: process.env.CF_API_TOKEN
  }
} 