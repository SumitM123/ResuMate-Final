const express = require('express')
const router = express.Router()
import {fileURL, setFileURL} from '../../open-resume/src/app/resume-parser/page'
import { readPdf, textItems, setTextItems } from "../../open-resume/src/app/lib/parse-resume-from-pdf/read-pdf"
router.post('/', (req, res) => {
    const file = req.body;
    const fileParsed = readPdf(file);
    setTextItems(fileParsed)
    const result = textItems;
    res.status(200).json(result);
});

module.exports = router;