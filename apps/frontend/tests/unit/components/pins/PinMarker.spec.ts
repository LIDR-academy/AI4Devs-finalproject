import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import PinMarker from '~/components/pins/PinMarker.vue';
import type { Pin } from '~/types/pin';

describe('PinMarker', () => {
  const mockPin: Pin = {
    id: '1',
    layerId: 'layer1',
    xCoord: 0.5,
    yCoord: 0.3,
    status: 'OPEN',
    createdBy: 'user1',
    guestName: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    comments: [
      { id: 'c1', pinId: '1', content: 'Test', authorId: 'user1', guestName: null, createdAt: '2024-01-01T00:00:00Z' }
    ]
  };

  it('should render correctly', () => {
    const wrapper = mount(PinMarker, {
      props: { pin: mockPin }
    });

    expect(wrapper.find('.pin-marker').exists()).toBe(true);
  });

  it('should apply correct position styles', () => {
    const wrapper = mount(PinMarker, {
      props: { pin: mockPin }
    });

    const button = wrapper.find('.pin-marker');
    const style = button.attributes('style');
    
    expect(style).toContain('left: 50%');
    expect(style).toContain('top: 30%');
  });

  it('should apply OPEN status classes', () => {
    const wrapper = mount(PinMarker, {
      props: { pin: mockPin }
    });

    const button = wrapper.find('.pin-marker');
    expect(button.classes()).toContain('text-orange-500');
  });

  it('should apply RESOLVED status classes', () => {
    const resolvedPin = { ...mockPin, status: 'RESOLVED' as const };
    const wrapper = mount(PinMarker, {
      props: { pin: resolvedPin }
    });

    const button = wrapper.find('.pin-marker');
    expect(button.classes()).toContain('text-gray-400');
    expect(button.classes()).toContain('opacity-60');
  });

  it('should show comment count badge', () => {
    const wrapper = mount(PinMarker, {
      props: { pin: mockPin }
    });

    const badge = wrapper.find('.bg-red-600');
    expect(badge.exists()).toBe(true);
    expect(badge.text()).toBe('1');
  });

  it('should show 9+ for more than 9 comments', () => {
    const pinWithManyComments = {
      ...mockPin,
      comments: Array(15).fill(null).map((_, i) => ({
        id: `c${i}`,
        pinId: '1',
        content: 'Test',
        authorId: 'user1',
        guestName: null,
        createdAt: '2024-01-01T00:00:00Z'
      }))
    };

    const wrapper = mount(PinMarker, {
      props: { pin: pinWithManyComments }
    });

    const badge = wrapper.find('.bg-red-600');
    expect(badge.text()).toBe('9+');
  });

  it('should emit click event with pin id', async () => {
    const wrapper = mount(PinMarker, {
      props: { pin: mockPin }
    });

    await wrapper.find('.pin-marker').trigger('click');
    
    expect(wrapper.emitted('click')).toBeTruthy();
    expect(wrapper.emitted('click')?.[0]).toEqual(['1']);
  });

  it('should not show badge when no comments', () => {
    const pinNoComments = { ...mockPin, comments: [] };
    const wrapper = mount(PinMarker, {
      props: { pin: pinNoComments }
    });

    const badge = wrapper.find('.bg-red-600');
    expect(badge.exists()).toBe(false);
  });
});
