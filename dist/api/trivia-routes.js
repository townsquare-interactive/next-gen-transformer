//import { VercelRequest, VercelResponse } from '@vercel/node'
import { sql } from '@vercel/postgres';
import express from 'express';
const router = express.Router();
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
    };
    try {
        console.log('there is a req for trivia');
        //const result = await sql`CREATE TABLE Questions ( Name varchar(255), QuestionList varchar(255) );`
        //const result = await sql`CREATE TABLE Questions ( Name varchar(255), QuestionList varchar(255) );`
        await sql `INSERT INTO Questions (Name, QuestionList) VALUES (${values.id}, ${jsonb_build_object(values.questions)});`;
        //return res.status(500).json({ none: 'no error yet' })
        //await client.sql`INSERT INTO Pets (Name, Owner) VALUES (${names[0]}, ${names[1]});`
        //INSERT INTO "Student" VALUES('912463857', 'Jon Smith', 'A-Level', 'BSc(Hons) Computer Science', '10/06/1990', '50 Denchworth Road', 'LONDON', 'OBN 244', 'England', '02077334444', 'Male', 'jonsmi', '123456');
        //await sql`INSERT INTO Questions (Name, QuestionList) VALUES (445, firstQ);`;
        //return res.status(200).json({ result })
        const questions = await sql `SELECT * FROM Questions;`;
        console.log(questions.rows[questions.rows.length - 1]);
        return res.status(200).json({ questions });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ 'this is error': { error } });
    }
});
export default router;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJpdmlhLXJvdXRlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2FwaS90cml2aWEtcm91dGVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDhEQUE4RDtBQUM5RCxPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sa0JBQWtCLENBQUE7QUFDdEMsT0FBTyxPQUFPLE1BQU0sU0FBUyxDQUFBO0FBQzdCLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQTtBQUUvQixvQkFBb0I7QUFDcEIsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRTtJQUN0QywyR0FBMkc7SUFFM0csSUFBSSxNQUFNLEdBQUc7UUFDVCxFQUFFLEVBQUUsS0FBSztRQUNULFNBQVMsRUFBRTtZQUNQO2dCQUNJLFFBQVEsRUFBRSxzQkFBc0I7Z0JBQ2hDLE9BQU8sRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO2dCQUN4QixhQUFhLEVBQUUsR0FBRzthQUNyQjtZQUNEO2dCQUNJLFFBQVEsRUFBRSxZQUFZO2dCQUN0QixPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztnQkFDeEIsYUFBYSxFQUFFLEdBQUc7YUFDckI7U0FDSjtLQUNKLENBQUE7SUFFRCxJQUFJO1FBQ0EsT0FBTyxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsQ0FBQyxDQUFBO1FBRXhDLG9HQUFvRztRQUNwRyxvR0FBb0c7UUFDcEcsTUFBTSxHQUFHLENBQUEsc0RBQXNELE1BQU0sQ0FBQyxFQUFFLEtBQUssa0JBQWtCLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUE7UUFDckgsdURBQXVEO1FBRXZELHFGQUFxRjtRQUNyRixpTkFBaU47UUFDak4sOEVBQThFO1FBRTlFLHlDQUF5QztRQUN6QyxNQUFNLFNBQVMsR0FBRyxNQUFNLEdBQUcsQ0FBQSwwQkFBMEIsQ0FBQTtRQUNyRCxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUN0RCxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQTtLQUM3QztJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ1osT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUNsQixPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsZUFBZSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFBO0tBQzlEO0FBQ0wsQ0FBQyxDQUFDLENBQUE7QUFFRixlQUFlLE1BQU0sQ0FBQSJ9