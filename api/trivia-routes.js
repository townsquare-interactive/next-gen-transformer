//import { VercelRequest, VercelResponse } from '@vercel/node'
import { sql } from '@vercel/postgres'
import express from 'express'
const router = express.Router()

//save from luna cms
router.post('/trivia', async (req, res) => {
    // let values = ['445', { question: 'here is our question', answers: ['A', 'B', 'C'], correctAnswer: 'B' }]

    let values = {
        id: '445',
        questions: [
            {
                question: 'here is our question',
                answers: ['A', 'B', 'C'],
                correctAnswer: 'B',
            },
            {
                question: 'question 2',
                answers: ['A', 'B', 'C'],
                correctAnswer: 'Q',
            },
        ],
    }

    try {
        console.log('there is a req for trivia')

        //const result = await sql`CREATE TABLE Questions ( Name varchar(255), QuestionList varchar(255) );`
        //const result = await sql`CREATE TABLE Questions ( Name varchar(255), QuestionList varchar(255) );`
        await sql`INSERT INTO Questions (Name, QuestionList) VALUES (${values.id}, ${jsonb_build_object(values.questions)});`
        //return res.status(500).json({ none: 'no error yet' })

        //await client.sql`INSERT INTO Pets (Name, Owner) VALUES (${names[0]}, ${names[1]});`
        //INSERT INTO "Student" VALUES('912463857', 'Jon Smith', 'A-Level', 'BSc(Hons) Computer Science', '10/06/1990', '50 Denchworth Road', 'LONDON', 'OBN 244', 'England', '02077334444', 'Male', 'jonsmi', '123456');
        //await sql`INSERT INTO Questions (Name, QuestionList) VALUES (445, firstQ);`;

        //return res.status(200).json({ result })
        const questions = await sql`SELECT * FROM Questions;`
        console.log(questions.rows[questions.rows.length - 1])
        return res.status(200).json({ questions })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ 'this is error': { error } })
    }
})

export default router
