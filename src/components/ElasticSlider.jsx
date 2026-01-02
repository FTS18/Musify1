import { animate, motion, useMotionValue, useMotionValueEvent, useTransform } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import './ElasticSlider.css';

const MAX_OVERFLOW = 50;

export default function ElasticSlider({
    value = 0,
    min = 0,
    max = 100,
    onChange,
    className = '',
    isStepped = false,
    stepSize = 1,
    leftIcon = <span className="material-icons slider-icon">volume_down</span>,
    rightIcon = <span className="material-icons slider-icon">volume_up</span>,
    showValue = false,
    accentColor = '#fff'
}) {
    return (
        <div className={`elastic-slider-container ${className}`}>
            <Slider
                value={value}
                min={min}
                max={max}
                onChange={onChange}
                isStepped={isStepped}
                stepSize={stepSize}
                leftIcon={leftIcon}
                rightIcon={rightIcon}
                showValue={showValue}
                accentColor={accentColor}
            />
        </div>
    );
}

function Slider({ value, min, max, onChange, isStepped, stepSize, leftIcon, rightIcon, showValue, accentColor }) {
    const [localValue, setLocalValue] = useState(value);
    const sliderRef = useRef(null);
    const [region, setRegion] = useState('middle');
    const clientX = useMotionValue(0);
    const overflow = useMotionValue(0);
    const scale = useMotionValue(1);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    useMotionValueEvent(clientX, 'change', latest => {
        if (sliderRef.current) {
            const { left, right } = sliderRef.current.getBoundingClientRect();
            let newValue;

            if (latest < left) {
                setRegion('left');
                newValue = left - latest;
            } else if (latest > right) {
                setRegion('right');
                newValue = latest - right;
            } else {
                setRegion('middle');
                newValue = 0;
            }

            overflow.jump(decay(newValue, MAX_OVERFLOW));
        }
    });

    const handlePointerMove = e => {
        if (e.buttons > 0 && sliderRef.current) {
            const { left, width } = sliderRef.current.getBoundingClientRect();
            let newValue = min + ((e.clientX - left) / width) * (max - min);

            if (isStepped) {
                newValue = Math.round(newValue / stepSize) * stepSize;
            }

            newValue = Math.min(Math.max(newValue, min), max);
            setLocalValue(newValue);
            if (onChange) onChange(newValue);
            clientX.jump(e.clientX);
        }
    };

    const handlePointerDown = e => {
        handlePointerMove(e);
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerUp = () => {
        animate(overflow, 0, { type: 'spring', bounce: 0.5 });
    };

    const getRangePercentage = () => {
        const totalRange = max - min;
        if (totalRange === 0) return 0;
        return ((localValue - min) / totalRange) * 100;
    };

    return (
        <>
            <motion.div
                onHoverStart={() => animate(scale, 1.2)}
                onHoverEnd={() => animate(scale, 1)}
                onTouchStart={() => animate(scale, 1.2)}
                onTouchEnd={() => animate(scale, 1)}
                style={{
                    scale,
                    opacity: useTransform(scale, [1, 1.2], [0.7, 1])
                }}
                className="elastic-slider-wrapper"
            >
                {leftIcon && (
                    <motion.div
                        animate={{
                            scale: region === 'left' ? [1, 1.4, 1] : 1,
                            transition: { duration: 0.25 }
                        }}
                        style={{
                            x: useTransform(() => (region === 'left' ? -overflow.get() / scale.get() : 0))
                        }}
                        className="elastic-slider-icon-wrapper"
                    >
                        {leftIcon}
                    </motion.div>
                )}

                <div
                    ref={sliderRef}
                    className="elastic-slider-root"
                    onPointerMove={handlePointerMove}
                    onPointerDown={handlePointerDown}
                    onPointerUp={handlePointerUp}
                >
                    <motion.div
                        style={{
                            scaleX: 1, // Disabled width increase to prevent overflow
                            scaleY: useTransform(overflow, [0, MAX_OVERFLOW], [1, 0.9]), // Reduced vertical squish
                            transformOrigin: useTransform(() => {
                                if (sliderRef.current) {
                                    const { left, width } = sliderRef.current.getBoundingClientRect();
                                    return clientX.get() < left + width / 2 ? 'right' : 'left';
                                }
                                return 'center';
                            }),
                            height: useTransform(scale, [1, 1.2], [4, 6]), // Thinner and less scale increase
                            marginTop: 0,
                            marginBottom: 0
                        }}
                        className="elastic-slider-track-wrapper"
                    >
                        <div className="elastic-slider-track">
                            <div 
                                className="elastic-slider-range" 
                                style={{ 
                                    width: `${getRangePercentage()}%`,
                                    backgroundColor: accentColor,
                                    boxShadow: `0 0 10px ${accentColor}`
                                }} 
                            />
                        </div>
                    </motion.div>
                </div>

                {rightIcon && (
                    <motion.div
                        animate={{
                            scale: region === 'right' ? [1, 1.4, 1] : 1,
                            transition: { duration: 0.25 }
                        }}
                        style={{
                            x: useTransform(() => (region === 'right' ? overflow.get() / scale.get() : 0))
                        }}
                        className="elastic-slider-icon-wrapper"
                    >
                        {rightIcon}
                    </motion.div>
                )}
            </motion.div>
            {showValue && <p className="elastic-slider-value">{Math.round(localValue)}</p>}
        </>
    );
}

function decay(value, max) {
    if (max === 0) return 0;
    const entry = value / max;
    const sigmoid = 2 * (1 / (1 + Math.exp(-entry)) - 0.5);
    return sigmoid * max;
}
