import React, { useRef, useEffect, useState, useCallback } from 'react';

/**
 * VirtualizedRow - High-performance horizontal scrolling with virtual rendering
 * Only renders visible cards, dramatically improving performance for large lists
 */
const VirtualizedRow = ({ 
    items, 
    renderItem, 
    itemWidth = 160, 
    gap = 12, 
    className = 'scroll-row' 
}) => {
    const containerRef = useRef(null);
    const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 });
    const [containerWidth, setContainerWidth] = useState(0);

    // Calculate visible items based on scroll position
    const calculateVisibleRange = useCallback(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const scrollLeft = container.scrollLeft;
        const width = container.clientWidth;

        const itemTotalWidth = itemWidth + gap;
        const start = Math.max(0, Math.floor(scrollLeft / itemTotalWidth) - 2);
        const visibleCount = Math.ceil(width / itemTotalWidth) + 4; // Overscan
        const end = Math.min(items.length, start + visibleCount);

        setVisibleRange({ start, end });
        setContainerWidth(width);
    }, [items.length, itemWidth, gap]);

    // Handle scroll events
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        calculateVisibleRange();

        const handleScroll = () => {
            requestAnimationFrame(calculateVisibleRange);
        };

        container.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', calculateVisibleRange);

        return () => {
            container.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', calculateVisibleRange);
        };
    }, [calculateVisibleRange]);

    const visibleItems = items.slice(visibleRange.start, visibleRange.end);
    const offsetLeft = visibleRange.start * (itemWidth + gap);
    const totalWidth = items.length * (itemWidth + gap);

    return (
        <div 
            ref={containerRef} 
            className={className}
            style={{ position: 'relative' }}
        >
            {/* Spacer to maintain scroll width */}
            <div style={{ width: totalWidth, height: 1, position: 'absolute' }} />
            
            {/* Rendered items */}
            <div style={{ 
                display: 'flex', 
                gap: `${gap}px`,
                transform: `translateX(${offsetLeft}px)`,
                willChange: 'transform'
            }}>
                {visibleItems.map((item, index) => (
                    <div key={visibleRange.start + index} style={{ flexShrink: 0 }}>
                        {renderItem(item, visibleRange.start + index)}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VirtualizedRow;
