import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function replaceDocumentId() {
  const oldId = '69ad83ca2ff8eea3bf2fb160';
  const newId = '69abdce8b5a4b65f25cd75a5';
  const newInvitedBy = '69abdbcab5a4b65f25cd75a2';

  const targetModel = db.clubInvites;

  try {
    console.log(`Looking for document with ID: ${oldId}...`);
    // 1. Fetch the original document
    const oldDoc = (await targetModel.findUnique({
      where: { id: oldId },
    })) as any;

    if (!oldDoc) {
      console.log('Original document not found!');
      return;
    }

    console.log('Document found. Swapping ID and invitedBy...');

    // 2. Extract data, excluding the old ID
    const { id, ...docData } = oldDoc;

    // 3. Insert the new document with the specified new ID and updated invitedBy
    await targetModel.create({
      data: {
        ...docData,
        id: newId,
        invitedBy: newInvitedBy,
      },
    });

    // 4. Delete the original document
    await targetModel.delete({
      where: { id: oldId },
    });

    console.log('Successfully replaced the document with the new _id!');
  } catch (error) {
    console.error('Error swapping documents:', error);
  } finally {
    await db.$disconnect();
  }
}

replaceDocumentId();
