import React, { useState, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";

// Configura el worker de PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

function PdfAsImageFull() {
    const [pdfFile, setPdfFile] = useState(null);
    const [images, setImages] = useState([]);

    const onFileChange = e => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async () => {
                setPdfFile(reader.result);
                await renderPDFToImages(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const renderPDFToImages = async pdfData => {
        const loadingTask = pdfjsLib.getDocument({
            data: atob(pdfData.split(",")[1])
        });
        const pdf = await loadingTask.promise;

        const imagesPromises = [];
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            imagesPromises.push(renderPageToImage(pdf, pageNum));
        }

        const imagesData = await Promise.all(imagesPromises);
        setImages(imagesData);
    };

    const renderPageToImage = async (pdf, pageNum) => {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        await page.render(renderContext).promise;

        return canvas.toDataURL("image/jpeg");
    };

    return (
        <div>
            <h1>Convertir PDF a JPG</h1>
            <input
                type="file"
                accept="application/pdf"
                onChange={onFileChange}
            />
            {images.length > 0 && (
                <div>
                    <h2>Archivos Convertidos</h2>
                    {images.map((image, index) => (
                        <div key={index}>
                            <img
                                src={image}
                                alt={`Converted PDF page ${index + 1}`}
                            />
                            <a
                                href={image}
                                download={`converted-image-page-${
                                    index + 1
                                }.jpg`}
                            >
                                Descargar Imagen {index + 1}
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default PdfAsImageFull;
