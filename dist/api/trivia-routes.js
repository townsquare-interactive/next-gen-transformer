//import { VercelRequest, VercelResponse } from '@vercel/node'
import { sql } from '@vercel/postgres';
import { db } from '@vercel/postgres';
import express from 'express';
const router = express.Router();
//save from luna cms
router.post('/trivia', async (req, res) => {
    let values = ['445', { question: 'here is our question', answers: ['A', 'B', 'C'], correctAnswer: 'A' }];
    const client = await db.connect();
    try {
        console.log('there is a req for trivia');
        //const result = await sql`CREATE TABLE Questions ( Name varchar(255), QuestionList varchar(255) );`
        //const result = await sql`CREATE TABLE Questions ( Name varchar(255), QuestionList varchar(255) );`
        await sql `INSERT INTO Questions (Name, QuestionList) VALUES (${values[0]}, ${values[1]});`;
        //return res.status(500).json({ none: 'no error yet' })
        //await client.sql`INSERT INTO Pets (Name, Owner) VALUES (${names[0]}, ${names[1]});`
        //INSERT INTO "Student" VALUES('912463857', 'Jon Smith', 'A-Level', 'BSc(Hons) Computer Science', '10/06/1990', '50 Denchworth Road', 'LONDON', 'OBN 244', 'England', '02077334444', 'Male', 'jonsmi', '123456');
        //await sql`INSERT INTO Questions (Name, QuestionList) VALUES (445, firstQ);`;
        //return res.status(200).json({ result })
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ 'this is error': { error } });
    }
    const questions = await sql `SELECT * FROM Questions;`;
    return response.status(200).json({ questions });
});
export default router;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJpdmlhLXJvdXRlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2FwaS90cml2aWEtcm91dGVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDhEQUE4RDtBQUM5RCxPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sa0JBQWtCLENBQUE7QUFDdEMsT0FBTyxFQUFFLEVBQUUsRUFBRSxNQUFNLGtCQUFrQixDQUFBO0FBRXJDLE9BQU8sT0FBTyxNQUFNLFNBQVMsQ0FBQTtBQUM3QixNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUE7QUFFL0Isb0JBQW9CO0FBQ3BCLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUU7SUFDdEMsSUFBSSxNQUFNLEdBQUcsQ0FBQyxLQUFLLEVBQUUsRUFBRSxRQUFRLEVBQUUsc0JBQXNCLEVBQUUsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxhQUFhLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQTtJQUN4RyxNQUFNLE1BQU0sR0FBRyxNQUFNLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtJQUNqQyxJQUFJO1FBQ0EsT0FBTyxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsQ0FBQyxDQUFBO1FBRXhDLG9HQUFvRztRQUNwRyxvR0FBb0c7UUFDcEcsTUFBTSxHQUFHLENBQUEsc0RBQXNELE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQTtRQUMxRix1REFBdUQ7UUFFdkQscUZBQXFGO1FBQ3JGLGlOQUFpTjtRQUNqTiw4RUFBOEU7UUFFOUUseUNBQXlDO0tBQzVDO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDWixPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFBO1FBQ2xCLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxlQUFlLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUE7S0FDOUQ7SUFFRCxNQUFNLFNBQVMsR0FBRyxNQUFNLEdBQUcsQ0FBQSwwQkFBMEIsQ0FBQTtJQUNyRCxPQUFPLFFBQVEsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQTtBQUNuRCxDQUFDLENBQUMsQ0FBQTtBQUVGLGVBQWUsTUFBTSxDQUFBIn0=