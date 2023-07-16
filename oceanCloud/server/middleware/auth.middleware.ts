import jwt from 'jsonwebtoken';
import 'dotenv/config'
import { Express, Request, Response, NextFunction } from "express";

const authMiddle = (req: any, res: Response, next: NextFunction) => {
    
    if (req.method === 'OPTIONS') {
        return next()
    }

    try {
        const token: string | undefined = req.headers.authorization?.split(' ')[1]
        if (!token) {
            return res.status(401).json({message: 'Auth error'})
        }
        const decoded = jwt.verify(token, process.env.SECRET_KEY as string)
        req.user = decoded;
        next()
    } catch (e: any) {
        return res.status(401).json({message: 'Auth error', error: e.message})
    }
}

export default authMiddle;