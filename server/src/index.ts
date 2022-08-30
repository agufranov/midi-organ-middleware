import express from 'express'

const PORT = 5042

const app = express()
app.listen(PORT, () => console.log(`Server listening on port ${PORT}...`))