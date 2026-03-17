import React from 'react';
import { render } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { NotificationSettings } from './NotificationSettings';
import { NotificationService } from '../../services/NotificationService';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
}));

// Mock NotificationService
jest.mock('../../services/NotificationService');

const mockUseTranslation = useTranslation as jest.MockedFunction<typeof useTranslation>;
const MockNotificationService = NotificationService as jest.MockedClass<typeof NotificationService>;

describe('NotificationSettings', () => {
  let mockNotificationService: jest.Mocked<NotificationService>;

  beforeEach(() => {
    mockUseTranslation.mockReturnValue({
      t: (key: string) => key,
      i18n: {} as any,
    });

    mockNotificationService = {
      isSupported: jest.fn(),
      requestPermission: jest.fn(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
      getSubscriptionStatus: jest.fn(),
    } as any;

    MockNotificationService.mockImplementation(() => mockNotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    mockNotificationService.isSupported.mockReturnValue(true);
    mockNotificationService.getSubscriptionStatus.mockResolvedValue({
      isSubscribed: false,
      endpoint: null,
    });

    const { container } = render(<NotificationSettings />);
    expect(container).toBeInTheDocument();
  });

  it('should show not supported message when push notifications are not supported', () => {
    mockNotificationService.isSupported.mockReturnValue(false);

    const { getByText } = render(<NotificationSettings />);
    expect(getByText('notifications.notSupported')).toBeInTheDocument();
  });

  it('should show supported message when push notifications are supported', async () => {
    mockNotificationService.isSupported.mockReturnValue(true);
    mockNotificationService.getSubscriptionStatus.mockResolvedValue({
      isSubscribed: false,
      endpoint: null,
    });

    const { getByText } = render(<NotificationSettings />);
    expect(getByText('notifications.title')).toBeInTheDocument();
  });
});
