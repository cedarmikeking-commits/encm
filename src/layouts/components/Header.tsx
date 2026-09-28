import React from 'react';

import { getToken, toPersonal } from '@/utils/auth';

const Header: React.FC = () => (
  <header className="  w-full ">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-6">
          {/* 面包屑导航 */}
          {/* <div className="flex items-center space-x-2 text-sm text-slate-600">
              <p className="text-sm text-gray-500">
                {new Date().toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long',
                })}
              </p>
            </div> */}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="">
          <button
            onClick={() => toPersonal({ token: getToken()! })}
            className="w-full px-6 py-3 rounded-xl transition-all bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-600 hover:to-cyan-500 text-white flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </header>
);

export default Header;
