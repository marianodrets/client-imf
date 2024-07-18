import React, { useEffect, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
import axios from "axios";

// Configura el worker de PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

function PdfAsImageAuto() {
    const [images, setImages] = useState([]);

    const renderPDFToImages = useCallback(async pdfData => {
        const loadingTask = pdfjsLib.getDocument({ data: pdfData });
        const pdf = await loadingTask.promise;

        const imagesPromises = [];
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            imagesPromises.push(renderPageToImage(pdf, pageNum));
        }

        const imagesData = await Promise.all(imagesPromises);
        setImages(imagesData);
        await uploadImages(imagesData);
    }, []);

    useEffect(() => {
        const loadPdf = async () => {
            const pdfPath = `${process.env.PUBLIC_URL}/imagen.pdf`;
            const pdfData = await fetch(pdfPath).then(res => res.arrayBuffer());
            const pdfUint8Array = new Uint8Array(pdfData);
            await renderPDFToImages(pdfUint8Array);
        };

        loadPdf();
    }, [renderPDFToImages]);

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

    const uploadImages = async images => {
        const formData = new FormData();
        images.forEach((image, index) => {
            const blob = dataURLtoBlob(image);
            formData.append("images", blob, `imagen_${index + 1}.jpg`);
        });

        try {
            await axios.post("http://localhost:3001/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
        } catch (error) {
            console.error("Error uploading images:", error);
        }
    };

    const dataURLtoBlob = dataURL => {
        const arr = dataURL.split(",");
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    };

    return (
        <div>
            <h1>Convertir PDF a JPG</h1>
            {images.length > 0 && (
                <div>
                    <h2>Archivos Convertidos</h2>
                    {images.map((image, index) => (
                        <div key={index}>
                            <img
                                src={image}
                                alt={`Converted PDF page ${index + 1}`}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default PdfAsImageAuto;

/*
Uso de useCallback para renderPDFToImages:

useCallback memoriza la función renderPDFToImages para que no se recree en cada renderizado, evitando problemas de dependencias en useEffect.
Agregar renderPDFToImages como dependencia en useEffect:

Al incluir renderPDFToImages en la lista de dependencias de useEffect, nos aseguramos de que el efecto se ejecute correctamente si renderPDFToImages cambia.
Esta solución mantiene el código organizado y evita la advertencia de ESLint, asegurando que el hook useEffect se ejecute correctamente cuando sea necesario.


import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

const PdfReader = () => {
  const [pdfFiles, setPdfFiles] = useState([]);
  const [pageCounts, setPageCounts] = useState({});

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setPdfFiles(files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const typedArray = new Uint8Array(e.target.result);
        const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
        setPageCounts((prev) => ({
          ...prev,
          [file.name]: pdf.numPages,
        }));
      };
      reader.readAsArrayBuffer(file);
    });
  };

  return (
    <div>
      <input type="file" accept="application/pdf" multiple onChange={handleFileChange} />
      <ul>
        {pdfFiles.map((file) => (
          <li key={file.name}>
            {file.name} - {pageCounts[file.name] ? `${pageCounts[file.name]} páginas` : 'Cargando...'}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PdfReader;



*/
