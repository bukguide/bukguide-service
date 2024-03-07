const convertTsVector = (inputValue: string) => {
    return inputValue.replace(" ", " | ")
}

const checkPermission = (req: any, role: string[]) => {
    const checkRole = role.find(role => role === req.user.data.permission.role)
    return checkRole
}

export { convertTsVector, checkPermission }