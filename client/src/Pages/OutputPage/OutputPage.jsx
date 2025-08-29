import { useLocation } from 'react-router-dom';

function OutputPage() {
  const location = useLocation();
  const pdfUrl = location.state.pdfUrl;

  const handleDownload = () => {
    // Create a temporary anchor element
    const link = document.createElement('a');

    // Set the href to the blob URL
    link.href = pdfUrl;

    // Set the `download` attribute with a desired filename
    link.download = 'document.pdf'; // Or a dynamic name like `document-${Date.now()}.pdf`

    // Append the link to the document body (needed for Firefox)
    document.body.appendChild(link);

    // Programmatically click the link to trigger the download
    link.click();

    // Clean up: remove the temporary link and revoke the blob URL
    document.body.removeChild(link);
    URL.revokeObjectURL(pdfUrl); // Important for memory management
  };

  return (
    <div>
      <h1>Your PDF is Ready!</h1>
      {/* You can display the PDF in an iframe for a preview */}
      <iframe src={pdfUrl} width="100%" height="500px" title="PDF Preview"></iframe>
      <button onClick={handleDownload}>
        Download PDF
      </button>
    </div>
  );
}