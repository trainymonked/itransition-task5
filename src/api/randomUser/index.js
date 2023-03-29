function applyErrors(faker, field, locale, fieldErrors, type) {
    if (!fieldErrors) {
        return field
    }
    let newField = field
    Array.from(Array(fieldErrors)).forEach(() => {
        newField = applyError(faker, newField, locale, type)
    })
    return newField
}

function applyError(faker, field, locale, type) {
    switch (faker.datatype.number(2)) {
        case 0:
            return addRandomChar(faker, field, locale, type)
        case 1:
            return swapRandomChars(faker, field)
        case 2:
            return removeRandomChar(faker, field)
    }
}

function removeRandomChar(faker, field) {
    if (!field.length) {
        return field
    }
    const idx = faker.datatype.number(field.length - 1)
    return field.slice(0, idx).concat(field.slice(idx + 1, field.length))
}

function addRandomChar(faker, field, locale, type) {
    let char
    switch (type) {
        case 'numeric':
            char = faker.random.numeric()
            break
        case 'alpha': {
            switch (locale) {
                case 'en_US':
                    char = faker.random.alpha()
                    break
                case 'ru':
                    char = faker.helpers.arrayElement(generateAlphabet('\u0430', '\u044f'))
                    break
                case 'ge':
                    char = faker.helpers.arrayElement(generateAlphabet('\u10D0', '\u10FF'))
                    break
            }
            break
        }
        case 'alphanumeric': {
            switch (locale) {
                case 'en_US':
                    char = faker.random.alphaNumeric()
                    break
                case 'ru':
                    char = faker.helpers.arrayElement([
                        ...generateAlphabet('\u0430', '\u044f'),
                        ...Array.from('0123456789'),
                    ])
                    break
                case 'ge':
                    char = faker.helpers.arrayElement([
                        ...generateAlphabet('\u10D0', '\u10FF'),
                        ...Array.from('0123456789'),
                    ])
                    break
            }
            break
        }
    }
    if (!field.length) {
        return char
    }
    const idx = faker.datatype.number(field.length - 1)
    return field
        .slice(0, idx)
        .concat(char)
        .concat(field.slice(idx + 1, field.length))
}

function generateAlphabet(first, last) {
    const alphabet = []
    for (let i = first.charCodeAt(0), end = last.charCodeAt(0); i <= end; ++i) {
        alphabet.push(String.fromCharCode(i))
    }
    return alphabet
}

function swapRandomChars(faker, field) {
    if (field.length < 2) {
        return field
    }
    let idx1 = faker.datatype.number(field.length - 1)
    let idx2
    if (idx1 === 0) {
        idx2 = 1
    } else if (idx1 === field.length - 1) {
        idx2 = field.length - 2
    } else {
        idx2 = idx1 + faker.helpers.arrayElement([1, -1])
    }
    if (idx1 > idx2) {
        const i = idx1
        idx1 = idx2
        idx2 = i
    }
    return field.substring(0, idx1) + field[idx2] + field[idx1] + field.substring(idx2 + 1)
}

export default function randomUser(faker, locale, errors) {
    faker.locale = locale
    const city = faker.address.cityName()
    const address = faker.address.streetAddress(faker.datatype.boolean())
    let state, phoneNumber, fullName
    switch (locale) {
        case 'en_US':
            phoneNumber = faker.phone.number('+1-###-###-####')
            fullName = faker.name.firstName() + ' ' + faker.name.middleName() + ' ' + faker.name.lastName()
            state = faker.address.stateAbbr()
            break
        case 'ru':
            phoneNumber = faker.phone.number('+7 (###) ###-####')
            fullName = faker.name.fullName()
            break
        case 'ge':
            phoneNumber = faker.phone.number('+995-###-###-###')
            fullName = faker.name.firstName() + ' ' + faker.name.lastName()
            break
    }
    const fullAddress = city + (state ? ` ${state}` : '') + ', ' + address
    const uuid = faker.datatype.uuid()
    const fs1 = faker.datatype.number(Math.round(errors))
    const fs2 = faker.datatype.number(Math.round(errors - fs1))
    const fs3 = Math.round(errors - fs2 - fs1)
    return {
        uuid: uuid,
        fullName: applyErrors(faker, fullName, locale, fs2, 'alpha'),
        fullAddress: applyErrors(faker, fullAddress, locale, fs1, 'alphanumeric'),
        phoneNumber: applyErrors(faker, phoneNumber, locale, fs3, 'numeric'),
    }
}
