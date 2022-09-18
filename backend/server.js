import Express from "express"
import bodyParser from "body-parser"
import cors from "cors"
import MySQL from "mysql2/promise"
import dotenv from "dotenv"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import cookieParser from "cookie-parser"
import multer from "multer"
import fs from "fs/promises"
import path from "path"

dotenv.config({path:'./Secret_data/.env'})
const { APP_Port, MySQL_UserName, MySQL_Password, MySQL_Host, MySQL_Port, MySQL_DBName, Rounds, secret } = process.env;
const configdb = {
    port: MySQL_Port,
    host: MySQL_Host,
    user: MySQL_UserName,
    password: MySQL_Password,
    database: MySQL_DBName,
    connectionLimit:10,
    waitForConnections: true,
    queueLimit: 0
}
const pool = MySQL.createPool(configdb);

const jsonParser = bodyParser.json();


const app = Express();

const saltRounds = parseInt(Rounds);

const corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(Express.json({limit: '50mb'}), Express.urlencoded({ extended: true,limit: "50mb" }), cookieParser(), cors(corsOptions), (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
}
);

app.get("/random", async (req, res) => {
    const randomstring = Math.random().toString(36).slice(-8);
    return res.json({ password: randomstring });
})

app.post("/register", jsonParser, async (req, res) => {
    if (req.body.Secret == secret) {
        const DB = await pool.getConnection();
        await DB.beginTransaction();
        bcrypt.hash(req.body.Password, saltRounds, async (err, hash) => {
            if (err) {
                return res.json({ error: err, message: "Error while hashing password" });
            } else {
                if (Object.keys(req.body).toString() == "FirstName,LastName,Email,Password,Secret") {
                    await DB.query(`INSERT INTO user (FirstName,LastName,Email,Password) VALUES (?,?,?,?)`, [req.body.FirstName, req.body.LastName, req.body.Email, hash]).then(async () => {
                        await DB.commit();
                        await DB.release()
                        return res.json({ message: "Register succeed" });
                    }).catch(err => {
                        return res.json({ error: err, message: "Register fail" });
                    })
                } else {
                    return res.json({ error: "Invalid Request", message: "Data keys missing or exceeded." });
                }
            }
        })
    } else {
        return res.json({ error: "Invalid Request", message: "Secret key is invalid." });
    }
})

app.post("/login", jsonParser, async (req, res) => {
    if (req.body.Secret == secret) {
        const DB = await pool.getConnection();
        await DB.beginTransaction();
        await DB.query('SELECT * FROM user WHERE Email = ? ', [req.body.Email]).then(async ([result, fields]) => {
            await DB.commit();
            await DB.release()
            if (result.length == 0) {
                return res.json({ error: "Invalid Request", message: "Email incorrect" });
            } else {
                bcrypt.compare(req.body.Password, result[0].Password, function (err, data) {
                    if (err) {
                        return res.json({ error: err, message: "Login fail" });
                    } else if (!(data)) {
                        return res.json({ error: "Invalid Request", message: "Password incorrect" });
                    } else {
                        let token = jwt.sign({ id: result[0].ID, email: result[0].Email }, secret);
                        return res.json({ message: "Login success", token: token });
                    }
                })
            }
        }).catch(err => {
            return res.json({ error: err, message: "Login fail" });
        })
    } else {
        return res.json({ error: "Invalid Request", message: "Secret key incorrect" });
    }
})

app.post("/getUser", jsonParser, async (req, res) => {
    const TOKEN = req.body.Cookies;
    if (!TOKEN) {
        res.json({ error: "Invalid Request", message: "No token found" });
    } else {
        try {
            const data = jwt.verify(TOKEN, req.body.Secret);
            const DB = await pool.getConnection();
            await DB.beginTransaction();
            await DB.query('SELECT * FROM user WHERE ID = ? AND Email = ?', [data.id, data.email]).then(async ([result, fields]) => {
                await DB.commit();
                await DB.release()
                if (result.length == 0) {
                    return res.json({ error: "Invalid Request", message: "No user found" });
                } else {
                    delete result[0].Password
                    await fs.readFile(result[0].Avatar, "base64").then(async data => {
                        result[0].Avatar = "data:image/" + path.extname(result[0].Avatar).split(".")[1] + ";base64," + data;
                        return res.json({ message: "Get user success", data: result[0] });
                    }).catch(err => {
                        return res.json({ error: err, message: "Get user fail" });
                    })
                }
            }).catch(err => {
                return res.json({ error: err, message: "Get user fail" });
            })
        } catch (err) {
            return res.json({ error: err, message: "Get user fail" });
        }
    }
})

app.post("/getPasslist", jsonParser, async (req, res) => {
    const TOKEN = req.body.Cookies;
    if (!TOKEN) {
        res.json({ error: "Invalid Request", message: "No token found" });
    } else {
        const data = jwt.verify(TOKEN, req.body.Secret);
        const DB = await pool.getConnection();
        await DB.beginTransaction();
        await DB.query('SELECT * FROM passlist WHERE user_ID = ?', [data.id]).then(async ([result, fields]) => {
            await DB.commit();
            await DB.release()
            if (result.length == 0) {
                return res.json({ error: "Invalid Request", message: "No passlist found" });
            } else {
                return res.json({message: "Get passlist success",data: result})
            }
            }).catch(err => {
                return res.json({ error: err, message: "Get passlist fail" });
        })
    }
})

app.post("/addPasslist", jsonParser, async (req, res) => {
    const TOKEN = req.body.Cookies;
    if (!TOKEN) {
        res.json({ error: "Invalid Request", message: "No token found" });
    } else {
        if (Object.keys(req.body).toString() == "Key,Password,Secret,Cookies") {
            const data = jwt.verify(TOKEN, req.body.Secret);
            const DB = await pool.getConnection();
            await DB.beginTransaction();
            await DB.query('INSERT INTO passlist (`Key`,`Password`,`user_ID`) VALUES (?,?,?)', [req.body.Key, hash, data.id]).then(async () => {
                await DB.commit();
                await DB.release()
                return res.json({ message: "Add Passlist succeed" });
            }).catch(err => {
                return res.json({ error: err, message: "Add Passlist fail" });
            })
        } else {
            console.log(req.body)
            return res.json({ error: "Invalid Request", message: "Data keys missing or exceeded." });
        }
        
    }
})

app.post("/updateUser", async (req, res) => {
    const TOKEN = req.body.Cookies;
    if (!TOKEN) {
        res.json({ error: "Invalid Request", message: "No token found" });
    } else {
        try {
            const base64Array = req.body.Avatar.split(';base64,');
            const dotfile = base64Array[0].split('/')[1]
            const base64Image = base64Array[1]
            const data = jwt.verify(TOKEN, req.body.Secret);
            const filename ='.\\avatars\\Avatar-'+ data.id + '.'+ dotfile
            await fs.readdir("avatars").then( files =>{
                files.forEach( async file => {
                    if (file.includes('Avatar-'+data.id+'.')){
                        await fs.unlink('.\\avatars\\'+file)
                    }
                })
            }
            ).catch(error =>{
                console.error(error)
            })
            await fs.writeFile(filename, base64Image, {encoding: 'base64'}).then( async () => {
                const DB = await pool.getConnection();
                await DB.beginTransaction();
                await DB.query('SELECT * FROM user WHERE ID = ? AND Email = ?', [data.id, data.email]).then(async ([result, fields]) => {
                    if (result.length == 0) {
                        return res.json({ error: "Invalid Request", message: "No user found" });
                    } else {
                        await DB.query('UPDATE user SET FirstName = ?, LastName = ?, Avatar = ? WHERE ID = ?', [req.body.FirstName, req.body.LastName, filename, data.id]).then(async () => {
                            await DB.commit();
                            await DB.release()
                            return res.json({ message: "Update user success"});
                        }).catch(err => {
                            return res.json({ error: err, message: "Update user fail" });
                        })
                    }
                }).catch(err => {
                    return res.json({ error: err, message: "Update user fail" });
                })
            }).catch( err => {
                return res.json({ error: err, message: "Update user fail" });
            })
        } catch (err) {
            return res.json({ error: err, message: "Update user fail" });
        }
    }
})

app.post("/deleteUser", async (req, res) => {
    const TOKEN = req.body.Cookies;
    if (!TOKEN) {
        res.json({ error: "Invalid Request", message: "No token found" });
    } else {
        try {
            const data = jwt.verify(TOKEN, req.body.Secret);
            const DB = await pool.getConnection();
            await DB.beginTransaction();
            await DB.query('SELECT * FROM user WHERE ID = ? AND Email = ?', [data.ID, data.Email]).then(async ([result, fields]) => {
                await DB.commit();
                await DB.release()
                if (result.length == 0) {
                    return res.json({ error: "Invalid Request", message: "No user found" });
                } else {
                    await DB.query('DELETE FROM user WHERE ID = ?', [data.ID]).then(() => {
                        return res.json({ message: "Delete user success" });
                    }).catch(err => {
                        return res.json({ error: err, message: "Delete user fail" });
                    })
                }
            }).catch(err => {
                return res.json({ error: err, message: "Delete user fail" });
            })
        } catch (err) {
            return res.json({ error: err, message: "Delete user fail" });
        }
    }
})

app.post("/getAllUser", async (req, res) => {
    if (req.body.Secret == secret && req.body.saltRounds == saltRounds) {
        const DB = await pool.getConnection();
        await DB.beginTransaction();
        await DB.query('SELECT * FROM user').then(async ([result, fields]) => {
            await DB.commit();
            await DB.release()
            if (result.length == 0) {
                return res.json({ error: "Invalid Request", message: "No user found" });
            } else {
                return res.json({ message: "Get all user success", data: result });
            }
        }).catch(err => {
            return res.json({ error: err, message: "Get all user fail" });
        })
    } else {
        return res.json({ error: "Invalid Request", message: "Incorrect secret data" });
    }
})

app.get("/default_avatar", async (req, res) => {
    await fs.readFile('avatars\\default_avatar.jpg', "base64").then(async data => {
        const avatar = "data:image/" + path.extname('avatars\\default_avatar.jpg').split(".")[1] + ";base64," + data;
        return res.json({ message: "Get default avatar success", data: avatar });
    }).catch(err => {
        return res.json({ error: err, message: "Get default avatar fail" });
    })
})

app.listen(APP_Port, () => {
    console.log(`http://localhost:${APP_Port}/`);
});