// Recursively discover all spec files
let context = require.context('./src', true, /\.spec\.js$/)

// Load discovered spec files
context.keys().forEach(context)
