import { ValidationError } from 'class-validator';

const CONSTRAINT_MESSAGES: Record<string, (field: string) => string> = {
    isNotEmpty: (field) => `Polje "${field}" je obavezno`,
    isString: (field) => `Polje "${field}" mora biti tekst`,
    isBoolean: (field) => `Polje "${field}" mora biti true/false vrednost`,
    isNumber: (field) => `Polje "${field}" mora biti broj`,
    isInt: (field) => `Polje "${field}" mora biti ceo broj`,
    isMongoId: (field) => `Polje "${field}" mora biti validan ID`,
    isDateString: (field) => `Polje "${field}" mora biti validan datum`,
    isObject: (field) => `Polje "${field}" mora biti objekat`,
    isArray: (field) => `Polje "${field}" mora biti niz`,
    isEmail: (field) => `Polje "${field}" mora biti validna email adresa`,
    minLength: (field) => `Polje "${field}" je prekratko`,
    maxLength: (field) => `Polje "${field}" je predugačko`,
    whitelistValidation: (field) => `Polje "${field}" nije dozvoljeno`,
};

function translateConstraint(constraintKey: string, field: string): string {
    const translate = CONSTRAINT_MESSAGES[constraintKey];
    return translate ? translate(field) : `Polje "${field}" nije validno`;
}

export function formatValidationErrors(errors: ValidationError[]): string[] {
    const messages: string[] = [];

    for (const error of errors) {
        if (error.constraints) {
            for (const constraintKey of Object.keys(error.constraints)) {
                messages.push(translateConstraint(constraintKey, error.property));
            }
        }
        if (error.children?.length) {
            messages.push(...formatValidationErrors(error.children));
        }
    }

    return messages;
}
