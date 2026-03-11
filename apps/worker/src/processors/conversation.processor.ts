import { Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ProcessConversationJobData {
  conversationId: string;
  orderId: string;
  userId: string;
  conversationType: string;
}

export async function conversationProcessor(job: Job<ProcessConversationJobData>) {
  const { conversationId, orderId, userId, conversationType } = job.data;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { store: true },
  });

  if (!user || !order) {
    throw new Error(`User ${userId} or Order ${orderId} not found`);
  }

  if (conversationType === 'GET_ADDRESS') {
    return processGetAddressJourney(conversationId, user, order);
  }

  if (conversationType === 'INFORMATION') {
    return processInformationJourney(conversationId, user, order);
  }

  throw new Error(`Unknown conversation type: ${conversationType}`);
}

async function processGetAddressJourney(
  conversationId: string,
  user: { firstName: string | null; lastName: string | null },
  order: { externalOrderNumber: string | null; store: { name: string } },
) {
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Usuario';
  const message = `¡Hola ${name}! 👋 Tienes un pedido pendiente (#${order.externalOrderNumber ?? 'N/A'}) de ${order.store.name}. ` +
    `Para completar el envío, necesito que me indiques la dirección de entrega. ` +
    `Por favor, escribe tu dirección completa (calle, número, código postal, ciudad).`;

  console.log(`[GET_ADDRESS] Conversation ${conversationId}: ${message}`);
  return { message, conversationType: 'GET_ADDRESS' };
}

async function processInformationJourney(
  conversationId: string,
  user: { firstName: string | null; lastName: string | null },
  order: { externalOrderNumber: string | null; store: { name: string } },
) {
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Usuario';
  const message = `¡Hola ${name}! ✅ Tu pedido #${order.externalOrderNumber ?? 'N/A'} de ${order.store.name} ha sido confirmado. ` +
    `La dirección de entrega que indicaste ha sido registrada correctamente. ` +
    `Tu pedido será enviado pronto. ¡Gracias por tu compra!`;

  console.log(`[INFORMATION] Conversation ${conversationId}: ${message}`);
  return { message, conversationType: 'INFORMATION' };
}
