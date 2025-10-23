import { motion } from 'framer-motion';
import { Button } from '../../ui/button';
import { Phone } from 'lucide-react';

export default function PhoneButton({ text = 'Continue with Phone', onClick }) {
  const handlePhoneLogin = () => {
    if (onClick) onClick();  
  };

  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Button
        type="button"
        variant="outline"
        className="w-full h-11 border-2 hover:bg-gray-50 transition-colors flex items-center justify-center"
        onClick={handlePhoneLogin}
      >
        <Phone className="w-5 h-5 mr-2 text-green-600" />
        {text}
      </Button>
    </motion.div>
  );
}
