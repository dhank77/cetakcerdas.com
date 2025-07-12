import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6 2C5.45 2 5 2.45 5 3V7H4C2.9 7 2 7.9 2 9V15C2 16.1 2.9 17 4 17H5V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V17H20C21.1 17 22 16.1 22 15V9C22 7.9 21.1 7 20 7H19V3C19 2.45 18.55 2 18 2H6ZM7 4H17V7H7V4ZM4 9H20V15H19V13C19 12.45 18.55 12 18 12H6C5.45 12 5 12.45 5 13V15H4V9ZM7 14H17V19H7V14ZM18 10C18.55 10 19 10.45 19 11C19 11.55 18.55 12 18 12C17.45 12 17 11.55 17 11C17 10.45 17.45 10 18 10Z"
            />
        </svg>
    );
}
