//import { VercelRequest, VercelResponse } from '@vercel/node'
import { sql } from '@vercel/postgres'
import { db } from '@vercel/postgres'

import express from 'express'
const router = express.Router()

//save from luna cms
router.post('/trivia', async (req, res) => {
    let values = ['445', { question: 'here is our question', answers: ['A', 'B', 'C'], correctAnswer: 'A' }]
    const client = await db.connect()
    try {
        console.log('there is a req for trivia')

        //const result = await sql`CREATE TABLE Questions ( Name varchar(255), QuestionList varchar(255) );`
        //const result = await sql`CREATE TABLE Questions ( Name varchar(255), QuestionList varchar(255) );`
        await sql`INSERT INTO Questions (Name, QuestionList) VALUES (${values[0]}, ${values[1]});`
        //return res.status(500).json({ none: 'no error yet' })

        //await client.sql`INSERT INTO Pets (Name, Owner) VALUES (${names[0]}, ${names[1]});`
        //INSERT INTO "Student" VALUES('912463857', 'Jon Smith', 'A-Level', 'BSc(Hons) Computer Science', '10/06/1990', '50 Denchworth Road', 'LONDON', 'OBN 244', 'England', '02077334444', 'Male', 'jonsmi', '123456');
        //await sql`INSERT INTO Questions (Name, QuestionList) VALUES (445, firstQ);`;

        //return res.status(200).json({ result })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ 'this is error': { error } })
    }

    const questions = await sql`SELECT * FROM Questions;`
    return response.status(200).json({ questions })
})

export default router
