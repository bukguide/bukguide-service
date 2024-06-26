import * as fs from 'fs';
import * as path from 'path';

const convertTsVector = (inputValue: string) => {
    return inputValue.replace(/\s/g, ' | ')
}

const checkPermission = (req: any, role: string[]) => {
    const checkRole = role.find(role => role === req.user.data.permission.role)
    return checkRole
}

const deleteFileInFolder = (folderPath: any) => {
    fs.readdir(folderPath, (err, files) => {
        files.forEach(file => {
            const filePath = path.join(folderPath, file);
            fs.unlink(filePath, err => {
                console.log('Đã xoá file:', filePath);
            });
        })
    })
}

async function maxId(table: any): Promise<number> {
    const maxIdResult = await table.aggregate({
        _max: {
            id: true,
        },
    });

    return maxIdResult._max ? maxIdResult._max.id + 1 : 1;
}

export { convertTsVector, checkPermission, deleteFileInFolder, maxId }