import React, { useRef, useEffect, useState, useCallback } from 'react';

/**
 * VirtualizedGrid - High-performance grid with virtual rendering
 * Only renders visible cards in the viewport
 */
const VirtualizedGrid = ({ 
    items, 
    renderItem, 
    columns = 5,
    itemHeight = 220,
    gap = 12,
    className = 'grid'
}) => {
    const containerRef = useRef(null);
    const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });

    // Calculate visible rows based on scroll position
    const calculateVisibleRange = useCallback(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const scrollTop = container.scrollTop || window.scrollY;
        const viewportHeight = window.innerHeight;

        const rowHeight = itemHeight + gap;
        const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - 1);
        const endRow = Math.ceil((scrollTop + viewportHeight) / rowHeight) + 1;

        const start = startRow * columns;
        const end = Math.min(items.length, endRow * columns);

        setVisibleRange({ start, end });
    }, [items.length, columns, itemHeight, gap]);

    // Handle scroll events
    useEffect(() => {
        calculateVisibleRange();

        const handleScroll = () => {
            requestAnimationFrame(calculateVisibleRange);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', calculateVisibleRange);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', calculateVisibleRange);
        };
    }, [calculateVisibleRange]);

    const visibleItems = items.slice(visibleRange.start, visibleRange.end);
    const totalRows = Math.ceil(items.length / columns);
    const totalHeight = totalRows * (itemHeight + gap);
    const offsetTop = Math.floor(visibleRange.start / columns) * (itemHeight + gap);

    return (
        <div 
            ref={containerRef} 
            className={className}
            style={{ 
                position: 'relative',
                minHeight: totalHeight
            }}
        >
            <div style={{ 
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap: `${gap}px`,
                transform: `translateY(${offsetTop}px)`,
                willChange: 'transform'
            }}>
                {visibleItems.map((item, index) => (
                    <div key={visibleRange.start + index}>
                        {renderItem(item, visibleRange.start + index)}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VirtualizedGrid;
