import * as fs from 'fs';

export const MAX_IMAGE_SIZE_IN_BYTES = 2000000;

export function getFilesizeInBytes(filename: string) {
  const stats = fs.statSync(filename);
  const fileSizeInBytes = stats.size;
  return fileSizeInBytes;
}

export async function getAllImagesInDirectory(directoryPath: string) {
  try {
    const files = await fs.promises.readdir(directoryPath);
    return files.filter((file) => file.match(/\.(jpg|jpeg|png|gif)$/i));
  } catch (error) {
    throw error;
  }
}

export function getUniqueFilename(name: string) {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const filename = uniqueSuffix + '-' + name;
  return filename;
}
