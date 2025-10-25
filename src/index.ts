import express, { Request, Response } from 'express'

const app = express()

app.get('/', (req: Request, res: Response) => {
    res.send('Working')
})

app.listen(3000, () => {
    console.log('App working')
})
