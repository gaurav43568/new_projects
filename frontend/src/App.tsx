import React from 'react';
import Imageprocesser from './components/Imageprocesser.tsx';

import { ImageProvider } from './context/ImageContext';

const App: React.FC = () => {
  return (
    <ImageProvider>
      <div>
        <Imageprocesser />
      </div>
    </ImageProvider>
  );
};

export default App;
