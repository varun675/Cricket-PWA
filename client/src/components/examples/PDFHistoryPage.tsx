import PDFHistoryPage from '../PDFHistoryPage';
import { PDFHistory } from '@shared/schema';

export default function PDFHistoryPageExample() {
  //todo: remove mock functionality
  const samplePDFHistory: PDFHistory[] = [
    {
      id: '1',
      matchId: 'match-1',
      filename: 'United77_vs_Delhi_Warriors_2024-01-15.pdf',
      createdAt: '2024-01-15T10:00:00Z',
      opponentTeam: 'Delhi Warriors',
      totalFees: 2400
    },
    {
      id: '2',
      matchId: 'match-2',
      filename: 'United77_vs_Mumbai_Kings_2024-01-20.pdf',
      createdAt: '2024-01-20T14:30:00Z',
      opponentTeam: 'Mumbai Kings',
      totalFees: 3000
    },
    {
      id: '3',
      matchId: 'match-3',
      filename: 'United77_vs_Bangalore_Blues_2024-01-25.pdf',
      createdAt: '2024-01-25T09:15:00Z',
      opponentTeam: 'Bangalore Blues',
      totalFees: 2800
    }
  ];

  const handleDownloadPDF = (pdf: PDFHistory) => {
    console.log('Download PDF:', pdf.filename);
  };

  const handleSharePDF = (pdf: PDFHistory) => {
    console.log('Share PDF:', pdf.filename);
  };

  const handleViewPDF = (pdf: PDFHistory) => {
    console.log('View PDF:', pdf.filename);
  };

  return (
    <div className="p-4">
      <PDFHistoryPage 
        pdfHistory={samplePDFHistory}
        onDownloadPDF={handleDownloadPDF}
        onSharePDF={handleSharePDF}
        onViewPDF={handleViewPDF}
      />
    </div>
  );
}