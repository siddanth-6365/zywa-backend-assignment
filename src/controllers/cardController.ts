import { Request, Response } from 'express';
import prisma from '../models';

export const getCardStatus = async (req: Request, res: Response) => {
  const { phoneNumber, cardId } = req.query;

  if (!phoneNumber && !cardId) {
    return res.status(400).json({ error: 'phoneNumber or cardId is required' });
  }

  try {
    let card: any;

    if (cardId) {
      card = await prisma.card.findUnique({
        where: { cardId: cardId as string },
        include: {
          user: true,
          events: {
            orderBy: { timestamp: 'desc' },
            take: 1,
          },
        },
      });
    } else if (phoneNumber) {
      const user = await prisma.user.findUnique({
        where: { phoneNumber: phoneNumber as string },
        include: {
          cards: {
            include: {
              events: {
                orderBy: { timestamp: 'desc' },
                take: 1,
              },
            },
          },
        },
      });

      if (user && user.cards.length > 0) {
        card = user.cards[0];
      } else {
        return res.status(404).json({ error: 'User or card not found' });
      }
    }

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    const latestEvent = card.events[0];

    res.json({
      cardId: card.cardId,
      phoneNumber: phoneNumber,
      status: latestEvent ? latestEvent.eventType : 'UNKNOWN',
      timestamp: latestEvent ? latestEvent.timestamp : null,
      comment: latestEvent ? latestEvent.comment : null,
    });
  } catch (error) {
    console.error('Error fetching card status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};