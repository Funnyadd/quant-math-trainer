import { useLayoutEffect, useRef } from "react";
import { MathfieldElement } from "mathlive";
import { computeEngine } from "./math.js";

MathfieldElement.computeEngine = computeEngine;
MathfieldElement.fontsDirectory = `${import.meta.env.BASE_URL}fonts`;
MathfieldElement.soundsDirectory = `${import.meta.env.BASE_URL}sounds`;

const tools = [
    { label: "x", title: "Variable x", latex: "x" },
    { label: "x²", title: "x squared", latex: "x^2" },
    {
        label: "Power",
        title: "Insert a power",
        latex: "\\placeholder{}^{\\placeholder{}}",
    },
    {
        label: "eˣ",
        title: "Exponential with an editable exponent",
        latex: "e^{\\placeholder{}}",
    },
    {
        label: "√",
        title: "Square root",
        latex: "\\sqrt{\\placeholder{}}",
    },
    {
        label: "Fraction",
        title: "Numerator over denominator",
        latex: "\\frac{\\placeholder{}}{\\placeholder{}}",
    },
    { label: "sin", title: "Sine", latex: "\\sin(\\placeholder{})" },
    { label: "cos", title: "Cosine", latex: "\\cos(\\placeholder{})" },
    { label: "( )", title: "Parentheses", latex: "(\\placeholder{})" },
    { label: "C", title: "Integration constant", latex: "C" },
    { label: "+", title: "Plus", latex: "+" },
    { label: "−", title: "Minus", latex: "-" },
];

export function MathInput({ onChange, onConfirm }) {
    const field = useRef(null);
    const callbacks = useRef({ onChange, onConfirm });
    useLayoutEffect(() => {
        callbacks.current = { onChange, onConfirm };
    }, [onChange, onConfirm]);

    useLayoutEffect(() => {
        const element = field.current;

        const handleInput = () => {
            callbacks.current.onChange(element.value);
        };

        const handleKeyDown = (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                event.stopPropagation();
                callbacks.current.onConfirm(element.value);
            }
        };

        element.addEventListener("input", handleInput);
        element.addEventListener("keydown", handleKeyDown);
        element.focus();

        return () => {
            element.removeEventListener("input", handleInput);
            element.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    function insert(latex) {
        const element = field.current;
        element.focus();
        element.insert(latex, { selectionMode: "placeholder" });
        callbacks.current.onChange(element.value);
    }

    return (
        <div className="math-editor">
            <math-field ref={field} aria-label="Math answer" />

            <div className="math-tools" role="group" aria-label="Math symbols">
                {tools.map((tool) => (
                    <button
                        key={tool.label}
                        type="button"
                        title={tool.title}
                        aria-label={tool.title}
                        onPointerDown={(event) => event.preventDefault()}
                        onClick={() => insert(tool.latex)}
                    >
                        {tool.label}
                    </button>
                ))}
            </div>

            <p className="hint">
                Tap a slot to fill it. Use the math keyboard for more symbols.
            </p>
        </div>
    );
}

export function MathDisplay({ latex, label }) {
    const field = useRef(null);

    useLayoutEffect(() => {
        field.current.readOnly = true;
        field.current.value = latex;
    }, [latex]);

    return (
        <math-field
            ref={field}
            className="math-display"
            read-only
            tabIndex={-1}
            aria-label={label || latex}
        />
    );
}
