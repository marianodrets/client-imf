import React, { useState, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
// import html2canvas from "html2canvas";

// Configura el worker de PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

function PdfAsImage() {
    const [pdfFile, setPdfFile] = useState(null);
    const [image, setImage] = useState(null);
    const canvasRef = useRef(null);

    const onFileChange = e => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async () => {
                setPdfFile(reader.result);
                await renderPDFToCanvas(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const renderPDFToCanvas = async pdfData => {
        // Espera a que el canvas esté disponible
        await new Promise(resolve => setTimeout(resolve, 0));

        const loadingTask = pdfjsLib.getDocument({
            data: atob(pdfData.split(",")[1])
        });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1 });
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        await page.render(renderContext).promise;
    };

    const convertToImage = () => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            const imgData = canvas.toDataURL("image/jpeg");
            setImage(imgData);
        }
    };

    return (
        <div>
            <h1>Convertir PDF to JPG</h1>
            <input
                type="file"
                accept="application/pdf"
                onChange={onFileChange}
            />
            {pdfFile && (
                <div>
                    <button onClick={convertToImage}>Convertir a JPG</button>
                    <div>
                        <canvas
                            ref={canvasRef}
                            style={{ border: "1px solid black" }}
                        ></canvas>
                    </div>
                </div>
            )}
            {image && (
                <div>
                    <h2>Archivo Convertido</h2>
                    <img src={image} alt="Converted PDF" />
                    <a href={image} download="converted-image.jpg">
                        Download Imagen
                    </a>
                </div>
            )}
        </div>
    );
}

export default PdfAsImage;
