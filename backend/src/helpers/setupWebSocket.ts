import { MessageService } from '../services/messagesService';
import { getWebSocketConnection } from '../configs/webSocket';
import { logger } from '../configs/logger';
import type { IMessage } from '../types/Message';
import parseJSON from './parseJson';

export function setupWebSocketServer() {
  const wss = getWebSocketConnection();

  wss.on('connection', ws => {
    logger.info('New WebSocket connection');

    // Обработка входящих сообщений
    ws.on('message', async message => {
      try {
        const messageString = message.toString ? message.toString() : message;

        const messageData = parseJSON(messageString);

        // const savedMessage = await MessageService.handleMessage(messageData);

        // ws.send(JSON.stringify({ status: 'success', message: savedMessage }));
      } catch (error) {
        logger.error('Error handling message:', error);

        ws.send(
          JSON.stringify({
            status: 'error',
            message: 'Failed to process message',
            error: error instanceof Error ? error.message : 'Unknown error',
          }),
        );
      }
    });

    ws.on('close', () => {
      logger.info('WebSocket connection closed');
    });
  });

  logger.info('WebSocket server is running');
}
