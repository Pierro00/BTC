const express = require('express');
const axios = require('axios');
const app = express();

const RPC_USER = 'piotr';
const RPC_PASS = 'qweasdzxc';
const RPC_PORT = 48332;

app.use(express.json());

app.post('/rpc', async (req, res) =>{
    try{
        const response = await axios.post(`http://127.0.0.1:${RPC_PORT}`, req.body, {
            auth: {
                username: RPC_USER,
                password: RPC_PASS
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3001, () => {
    console.log('Server started on port 3001');
});