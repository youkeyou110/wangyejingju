import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, waitForAsync } from '../../../utils/testUtils';
import App from '../../App';
import StyleEditor from '../../StyleEditor';
import LivePreview from '../../LivePreview';
import HistoryPanel from '../../HistoryPanel';

describe('组件集成测试', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    describe('样式编辑器与预览', () => {
        test('样式更改应该实时反映在预览中', async () => {
            const { container } = renderWithProviders(
                <>
                    <StyleEditor />
                    <LivePreview />
                </>
            );

            // 更改背景颜色
            const colorPicker = screen.getByLabelText('背景颜色');
            await userEvent.click(colorPicker);
            await userEvent.type(colorPicker, '#ff0000');

            // 等待更新
            await act(async () => {
                jest.advanceTimersByTime(300);
            });

            // 检查预览
            const preview = container.querySelector('.preview-content');
            expect(preview).toHaveStyle({ backgroundColor: '#ff0000' });
        });

        test('字体设置应该正确应用', async () => {
            const { container } = renderWithProviders(
                <>
                    <StyleEditor />
                    <LivePreview />
                </>
            );

            // 更改字体
            const fontSelect = screen.getByLabelText('字体');
            await userEvent.selectOptions(fontSelect, 'Arial');

            // 更改字号
            const sizeInput = screen.getByLabelText('字号');
            await userEvent.clear(sizeInput);
            await userEvent.type(sizeInput, '24');

            // 等待更新
            await act(async () => {
                jest.advanceTimersByTime(300);
            });

            // 检查预览
            const preview = container.querySelector('.preview-content');
            expect(preview).toHaveStyle({
                fontFamily: 'Arial',
                fontSize: '24px'
            });
        });
    });

    describe('历史记录与状态恢复', () => {
        test('操作历史应该正确记录和恢复', async () => {
            const { container } = renderWithProviders(
                <>
                    <StyleEditor />
                    <LivePreview />
                    <HistoryPanel />
                </>
            );

            // 执行一系列操作
            const colorPicker = screen.getByLabelText('背景颜色');
            await userEvent.click(colorPicker);
            await userEvent.type(colorPicker, '#ff0000');

            const fontSelect = screen.getByLabelText('字体');
            await userEvent.selectOptions(fontSelect, 'Arial');

            // 等待历史记录更新
            await act(async () => {
                jest.advanceTimersByTime(300);
            });

            // 检查历史记录
            const historyItems = screen.getAllByRole('listitem');
            expect(historyItems).toHaveLength(2);

            // 撤销操作
            const undoButton = screen.getByTitle('撤销');
            await userEvent.click(undoButton);

            // 等待状态恢复
            await act(async () => {
                jest.advanceTimersByTime(300);
            });

            // 检查预览是否恢复
            const preview = container.querySelector('.preview-content');
            expect(preview).not.toHaveStyle({ fontFamily: 'Arial' });
        });
    });

    describe('拖拽与布局', () => {
        test('工具栏应该可以拖动', async () => {
            const { container } = renderWithProviders(
                <App />
            );

            const toolbar = container.querySelector('.quick-toolbar');
            const handle = toolbar.querySelector('.toolbar-handle');

            // 执行拖动
            fireEvent.mouseDown(handle, { clientX: 0, clientY: 0 });
            fireEvent.mouseMove(handle, { clientX: 100, clientY: 100 });
            fireEvent.mouseUp(handle);

            // 检查位置
            expect(toolbar).toHaveStyle({
                transform: 'translate(100px, 100px)'
            });
        });
    });

    describe('性能监控集成', () => {
        test('性能警告应该触发UI更新', async () => {
            const { container } = renderWithProviders(
                <>
                    <LivePreview />
                    <PerformanceMonitor />
                </>
            );

            // 开始监控
            const startButton = screen.getByText('开始');
            await userEvent.click(startButton);

            // 模拟性能问题
            await act(async () => {
                // 触发性能警告
                const warningEvent = new CustomEvent('performanceWarning', {
                    detail: { type: 'fps', value: 20 }
                });
                window.dispatchEvent(warningEvent);

                jest.advanceTimersByTime(1000);
            });

            // 检查警告显示
            const warning = screen.getByText(/FPS: 20/);
            expect(warning).toBeInTheDocument();
        });
    });

    describe('数据持久化', () => {
        test('设置应该正确保存和恢复', async () => {
            const { unmount } = renderWithProviders(
                <App />
            );

            // 更改设置
            const colorPicker = screen.getByLabelText('背景颜色');
            await userEvent.click(colorPicker);
            await userEvent.type(colorPicker, '#ff0000');

            // 等待保存
            await act(async () => {
                jest.advanceTimersByTime(1000);
            });

            // 卸载组件
            unmount();

            // 重新渲染
            renderWithProviders(<App />);

            // 等待加载
            await act(async () => {
                jest.advanceTimersByTime(1000);
            });

            // 检查设置是否恢复
            const preview = container.querySelector('.preview-content');
            expect(preview).toHaveStyle({ backgroundColor: '#ff0000' });
        });
    });
});
