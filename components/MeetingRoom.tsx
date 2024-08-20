'use client';

import { useEffect, useState } from 'react';
import {
  CallControls,
  CallParticipantsList,
  CallStatsButton,
  CallingState,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
  useCall,
} from '@stream-io/video-react-sdk';
import { useRouter, useParams } from 'next/navigation';
import { Users, LayoutList } from 'lucide-react';
import { toast } from './ui/use-toast';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import Loader from './Loader';
import EndCallButton from './EndCallButton';
import { cn } from '@/lib/utils';
import Timer from './ui/Timer';
import MeetingSetup from './MeetingSetup';

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

const MeetingRoom = () => {
  const router = useRouter();
  const { id, personal } = useParams();
  const isPersonalRoom = !!personal;
  const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
  const [showParticipants, setShowParticipants] = useState(false);
  const { useCallCallingState, useCallEndedAt, useCallCustomData } = useCallStateHooks();
  const callingState = useCallCallingState();
  const callEndedAt = useCallEndedAt();
  const customData = useCallCustomData();
  const call = useCall(); // Get the call object using useCall hook
  const [startTimer, setStartTimer] = useState(false);
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  useEffect(() => {
    if (callingState === CallingState.JOINED) {
      setStartTimer(true);
    } else {
      setStartTimer(false);
    }
  }, [callingState]);

  useEffect(() => {
    if (callEndedAt) {
      const startTime = customData?.starts_at || "N/A";
      const endTime = new Date().toISOString();
      const duration = customData?.starts_at ? Math.floor((new Date(endTime).getTime() - new Date(customData.starts_at).getTime()) / 60000) : "unknown";
      const participantNames = call?.participants?.length > 0 ? call.participants.map((p) => p.user.name || p.user.id).join(', ') : "N/A";

      toast({
        title: 'Meeting Ended',
        description: `Start Time: ${startTime}, End Time: ${endTime}, Duration: ${duration !== "unknown" ? duration + " minutes" : "unknown"}, Participants: ${participantNames}`,
      });
    }
  }, [callEndedAt, customData, call]);

  useEffect(() => {
    if (customData?.duration) {
      const duration = customData.duration * 60 * 1000;
      const warningTime = duration - 30 * 1000;
      const endTime = duration;

      let warningTimer: NodeJS.Timeout;
      let endTimer: NodeJS.Timeout;

      if (callingState === CallingState.JOINED) {
        warningTimer = setTimeout(() => {
          toast({
            title: 'Meeting will end in 30 seconds',
            action: (
              <button
                onClick={() => {
                  clearTimeout(endTimer);
                  endTimer = setTimeout(() => {
                    setStartTimer(false);
                    const endTime = new Date().toISOString();
                    const duration = customData?.starts_at ? Math.floor((new Date(endTime).getTime() - new Date(customData.starts_at).getTime()) / 60000) : "unknown";
                    const participantNames = call?.participants?.length > 0 ? call.participants.map((p) => p.user.name || p.user.id).join(', ') : "N/A";

                    toast({
                      title: 'Meeting Ended',
                      description: `Start Time: ${customData.starts_at || "N/A"}, End Time: ${endTime}, Duration: ${duration} minutes, Participants: ${participantNames}`,
                    });
                  }, 10 * 60 * 1000);
                }}
              >
                Prolonger
              </button>
            ),
          });
        }, warningTime);

        endTimer = setTimeout(() => {
          setStartTimer(false);
          const endTime = new Date().toISOString();
          const duration = customData?.starts_at ? Math.floor((new Date(endTime).getTime() - new Date(customData.starts_at).getTime()) / 60000) : "unknown";
          const participantNames = call?.participants?.length > 0 ? call.participants.map((p) => p.user.name || p.user.id).join(', ') : "N/A";

          toast({
            title: 'Meeting Ended',
            description: `Start Time: ${customData.starts_at || "N/A"}, End Time: ${endTime}, Duration: ${duration} minutes, Participants: ${participantNames}`,
          });
        }, endTime);
      }

      return () => {
        clearTimeout(warningTimer);
        clearTimeout(endTimer);
      };
    }
  }, [callingState, customData, id, router, call]);

  const CallLayout = () => {
    switch (layout) {
      case 'grid':
        return <PaginatedGridLayout />;
      case 'speaker-right':
        return <SpeakerLayout participantsBarPosition="left" />;
      default:
        return <SpeakerLayout participantsBarPosition="right" />;
    }
  };

  if (!isSetupComplete) {
    return (
      <MeetingSetup 
        setIsSetupComplete={(value: boolean) => {
          setIsSetupComplete(value);
          setStartTimer(true);
        }} 
      />
    );
  }

  if (!id) {
    return <div>Meeting ID is missing</div>; // or handle this case appropriately
  }

  if (callingState !== CallingState.JOINED) return <Loader />;

  return (
    <section className="relative h-screen w-full overflow-hidden pt-4 text-white">
      <div className="relative flex size-full items-center justify-center">
        <div className="flex size-full max-w-[1000px] items-center">
          <CallLayout />
        </div>
        <div
          className={cn('h-[calc(100vh-86px)] hidden ml-2', {
            'show-block': showParticipants,
          })}
        >
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
      </div>
      <div className="absolute right-4 top-4 text-lg">
        <Timer start={startTimer} /> {/* Add the Timer component here */}
      </div>
      {/* video layout and call controls */}
      <div className="fixed bottom-0 flex w-full items-center justify-center gap-5">
        <CallControls onLeave={() => router.push(`/`)} />

        <DropdownMenu>
          <div className="flex items-center">
            <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
              <LayoutList size={20} className="text-white" />
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent className="border-dark-1 bg-dark-1 text-white">
            {['Grid', 'Speaker-Left', 'Speaker-Right'].map((item, index) => (
              <div key={index}>
                <DropdownMenuItem
                  onClick={() =>
                    setLayout(item.toLowerCase() as CallLayoutType)
                  }
                >
                  {item}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="border-dark-1" />
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <CallStatsButton />
        <button onClick={() => setShowParticipants((prev) => !prev)}>
          <div className="ml-2 hidden h-[calc(100vh-86px)] cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
            <Users size={20} className="text-white" />
          </div>
        </button>

        {!isPersonalRoom && <EndCallButton />}
      </div>
    </section>
  );
};

export default MeetingRoom;
