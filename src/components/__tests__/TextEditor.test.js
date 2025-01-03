import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithProviders, mockChromeAPI } from '../../utils/testUtils';
import TextEditor from '../TextEditor';

describe('TextEditor Component', () => {
    beforeEach(() => {
        mockChromeAPI();
    });

    it('renders without crashing', () => {
        renderWithProviders(<TextEditor />);
        expect(screen.getByTestId('text-editor')).toBeInTheDocument();
    });

    it('updates text content when typing', () => {
        renderWithProviders(<TextEditor />);
        const editor = screen.getByTestId('text-input');
        fireEvent.change(editor, { target: { value: 'Hello World' } });
        expect(editor.value).toBe('Hello World');
    });

    it('saves content when clicking save button', async () => {
        renderWithProviders(<TextEditor />);
        const editor = screen.getByTestId('text-input');
        const saveButton = screen.getByTestId('save-button');

        fireEvent.change(editor, { target: { value: 'Test Content' } });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(chrome.storage.local.set).toHaveBeenCalledWith(
                expect.objectContaining({
                    'editor-content': 'Test Content'
                })
            );
        });
    });

    it('loads saved content on mount', async () => {
        chrome.storage.local.get.mockImplementation((key, callback) => {
            callback({ 'editor-content': 'Saved Content' });
        });

        renderWithProviders(<TextEditor />);

        await waitFor(() => {
            const editor = screen.getByTestId('text-input');
            expect(editor.value).toBe('Saved Content');
        });
    });

    it('shows error message when save fails', async () => {
        chrome.storage.local.set.mockImplementation(() => {
            throw new Error('Save failed');
        });

        renderWithProviders(<TextEditor />);
        const saveButton = screen.getByTestId('save-button');

        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText('保存失败')).toBeInTheDocument();
        });
    });
});
