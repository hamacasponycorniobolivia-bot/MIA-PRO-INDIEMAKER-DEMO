import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Card from './Card';

const StatCard = ({
  title,
  value,
  trend,
  trendValue,
  trendText,
  suffix,
  icon: Icon,
  color = 'emerald'
}) => {
  const colorClasses = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  };

  const trendColor =
    trend === 'up'
      ? 'text-emerald-300'
      : trend === 'down'
        ? 'text-red-300'
        : 'text-slate-300';

  const TrendIcon =
    trend === 'up'
      ? TrendingUp
      : trend === 'down'
        ? TrendingDown
        : Minus;

  return (
    <Card className="h-full flex flex-col justify-between">
      <div className="flex items-start justify-between mb-4">
        <div className="min-w-0">
          <p
            className="
              mb-1.5
              text-2xl
              font-bold
              tracking-wide
              text-white
              [text-shadow:0_0_12px_rgba(255,255,255,0.28)]
            "
          >
            {title}
          </p>

          <div className="flex items-baseline gap-2.5">
            <h3
              className="
                text-4xl
                font-bold
                leading-none
                tracking-tight
                text-white
                [text-shadow:0_0_16px_rgba(255,255,255,0.18)]
              "
            >
              {value}
            </h3>

            {suffix && (
              <span
                className="
                  text-[1.15rem]
                  font-bold
                  tracking-wide
                  text-white
                  [text-shadow:0_0_10px_rgba(255,255,255,0.25)]
                "
              >
                {suffix}
              </span>
            )}
          </div>
        </div>

        <div
          className={`p-3 rounded-lg border ${colorClasses[color] || colorClasses.emerald}`}
        >
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>

      <div className="flex items-center gap-3 text-xl">
        <span
          className={`
            flex items-center
            font-bold
            ${trendColor}
            [text-shadow:0_0_10px_rgba(255,255,255,0.18)]
          `}
        >
          <TrendIcon className="w-4 h-4 mr-1" />
          {trendValue || trend || '0%'}
        </span>

        <span
          className="
            text-xl
            font-bold
            text-white
            [text-shadow:0_0_10px_rgba(255,255,255,0.32)]
          "
        >
          {trendText || 'vs mes anterior'}
        </span>
      </div>
    </Card>
  );
};

export default StatCard;
