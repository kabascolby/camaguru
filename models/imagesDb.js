const fs = require('fs');
const db = require('../utility/database');

/* declaring a private function in my class */

module.exports = class Images {
    constructor(imgInfos) {
        this.imgId = imgInfos.imgId;
        this.username = imgInfos.username;
        this.uId = imgInfos.userId;
        this.fname = imgInfos.fname;
        this.path = imgInfos.path;
        this.modification = imgInfos.modification;
        this.filter = imgInfos.filter;
    }

    save() {
        const sql = `INSERT INTO images
			(id, user_id, fname, path, meta, modif_date)
			VALUES(?, ?, ?, ?, ?, CURRENT_TIMESTAMP())`
        return db.execute(sql, [this.imgId, this.uId, this.fname, this.path, this.filter]);
    }

    static fetchByUser(userId) {
        const sql = `SELECT *
			FROM images
			WHERE user_id = '${userId}'
			ORDER BY create_date DESC`
        return db.execute(sql);
    }

    static fetchImage(uId, imgId) {
        const sql = `SELECT path FROM images
		WHERE user_id = ? AND id = ?`;

        return db.execute(sql, [uId, imgId]);
    }

    static findOneImgs(imgId, cb) {
        getUserId(imgId)
            .then(([
                [data]
            ]) => {
                let userId = data.user_id;
                this.fetchBinary(userId, data => {
                    cb(data);
                });
            })
            .catch(e => {
                cb(null);
                console.error(new Error('Invalide image Id', e));
            });
    }

    static fetchBinary(userId, cb) {
        this.fetchByUser(userId)
            .then(([userImgs, fieldData]) => {
                let imgsPromises = [];

                for (var imgProm of userImgs) {
                    imgsPromises.push(converToB64(imgProm));
                }

                Promise.all(imgsPromises)
                    .then(imgs => cb(imgs))
                    .catch(e => cb([]));
            })
            .catch(e => console.log(e));
    }

    static deleteImg(uId, imgId, cb) {


        var delSql = `DELETE FROM images 
			WHERE user_id = ? AND id = ?`;

        this.fetchImage(uId, imgId)
            .then(([data, fieldData]) => {
                cb([delImgFromDrive(data[0].path), db.execute(delSql, [uId, imgId])]); /* return an array of Promises */
            })
            .catch(e => console.error(e));
    }

    static fetchAll(cb) {
        /* Join two tables images and users to return all the images in a single array */
        const sql = `SELECT *
		FROM users u
		JOIN images i
		ON u.id = i.user_id 
		ORDER BY create_date DESC`

        db.execute(sql)
            .then(([userImgs, fieldData]) => {
                let imgsPromises = [];

                for (var imgProm of userImgs) {
                    imgsPromises.push(converToB64(imgProm));
                }

                Promise.all(imgsPromises)
                    .then(imgs => cb(imgs))
                    .catch(e => cb([]));
            })
            .catch(e => console.log(e));
    }

    static fetchPerPage(offset, itemsPerPage, cb) {
        /* Join two tables images and users to return all the images in a single array */
        const sql = `SELECT *
		FROM users u
		JOIN images i
		ON u.id = i.user_id 
		ORDER BY create_date DESC
		LIMIT ?, ?`
        db.execute(sql, [offset, itemsPerPage])
            .then(([userImgs, fieldData]) => {
                let imgsPromises = [];

                for (var imgProm of userImgs) {
                    imgsPromises.push(converToB64(imgProm));
                }

                Promise.all(imgsPromises)
                    .then(imgs => cb(imgs))
                    .catch(e => cb([]));
            })
            .catch(e => console.log(e));
    }

    static totalItems() {
        return db.execute(`SELECT COUNT(id) as total 
		FROM images`);
    }
    static updateImg(uId, imgId) {
        const sql = `UPDATE images 
			SET modif_date=NOW()
			WHERE user_id = ? AND id = ?`;
        db.execute(sql, [uId, imgId]);
    }
}

function getUserId(imgId) {
    const sql = `SELECT user_id FROM images Where id = ?`
    return db.execute(sql, [imgId]);
}

/* Making the file deletion a  promise */
function delImgFromDrive(path) {
    return new Promise((resolve, reject) => {
        fs.unlink(path, err => {
            if (err) reject(err);
            resolve('successfully deleted local image');
        })
    })
}

function converToB64(image) {
    return new Promise((resolve, reject) => {
        fs.readFile(image.path, { encoding: 'base64' }, (err, binary) => {
            if (err) {

                image.fname = ''
                resolve(image);
                console.error(new Error('Invalide Path', err));
            }
            image.path = binary;
            resolve(image);
        });
    })
}

/*
	TODO
	comment table implementation
	comment id;
	user id;
	comment date;
	comment description;
 */

/*
	TODO
	likes table implementation
	likes id;
	user id;
	likes date;
	likes description;
 */