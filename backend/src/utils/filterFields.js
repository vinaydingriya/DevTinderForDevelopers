function filterFields(user) {
    const filteredUser = user.toObject();
    const selectedFields = {};
    for (let field in filteredUser) {
        if (!("email password __v createdAt updatedAt").includes(field)) {
            selectedFields[field] = filteredUser[field];
        }
    }
    return selectedFields;
}

module.exports = {filterFields};