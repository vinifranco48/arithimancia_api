import { UnprocessableEntityException } from "../exceptions/validation"; 

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination?: string;
  filename?: string;
  path?: string;
  buffer?: Buffer;
}

export function isFileTypeValid(file: MulterFile, validTypes: string[], path: string[]): void {
    if (!file || !file.mimetype) {
        throw new UnprocessableEntityException("File is required");
    }
    if (!validTypes.includes(file.mimetype)) {
        throw new UnprocessableEntityException("Invalid file type", [
            {
                code: "custom",
                path: path,
                message: "Tipo de arquivo inválido. Esperado: " + validTypes.join(", ") + ".",
            }
        ]);
    }
}