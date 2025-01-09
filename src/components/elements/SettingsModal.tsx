import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateSettings } from '@/api';

import { SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';

export const SettingsModal = () => {
  const [successApply, setSuccessApply] = useState<boolean>(false);

  const { pathname } = useLocation();
  const roomID = pathname.split('/')[2];

  const FormSchema = z.object({
    invitation_expiry: z.enum(['30', '90', '270']),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      invitation_expiry: '30',
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    console.log(data.invitation_expiry);
    try {
      await updateSettings(roomID, data.invitation_expiry);
      setSuccessApply(true);
    } catch (error) {
      setSuccessApply(false);
      console.error(error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger>
        <div className='flex items-center py-[9px] px-12 border rounded-sm border-slate-200 hover:bg-slate-100 duration-300 ease-in-out'>
          <SettingsIcon className='size-16' />
        </div>
      </DialogTrigger>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='w-2/3 space-y-6'
        >
          <DialogContent className='sm:max-w-[400px]'>
            <DialogHeader>
              <DialogTitle>
                <div className='flex items-center gap-4'>
                  Settings <SettingsIcon className='size-16' />
                </div>
                <Separator className='w-full mt-8' />
              </DialogTitle>
            </DialogHeader>
            <div>
              <div className='flex gap-24 items-center mt-16 ml-4'>
                <div className='flex flex-col w-[120px]'>
                  <span className='text-sm font-medium'>
                    Invitation expiry:{' '}
                  </span>
                </div>
                <FormField
                  control={form.control}
                  name='invitation_expiry'
                  render={({ field }) => (
                    <FormItem className='space-y-12'>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className='flex flex-col space-y-4'
                        >
                          <FormItem className='flex items-center space-x-12 space-y-0'>
                            <FormControl>
                              <RadioGroupItem value='30' />
                            </FormControl>
                            <FormLabel className='font-normal'>
                              30 minutes
                            </FormLabel>
                          </FormItem>
                          <FormItem className='flex items-center space-x-12 space-y-0'>
                            <FormControl>
                              <RadioGroupItem value='90' />
                            </FormControl>
                            <FormLabel className='font-normal'>
                              90 minutes
                            </FormLabel>
                          </FormItem>
                          <FormItem className='flex items-center space-x-12 space-y-0'>
                            <FormControl>
                              <RadioGroupItem value='270' />
                            </FormControl>
                            <FormLabel className='font-normal'>
                              3 hours
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <DialogFooter className='flex items-center gap-12 mt-56'>
              {successApply && (
                <span className='font-bold text-xs text-green-600'>
                  Changes applied!
                </span>
              )}
              <Button
                size='sm'
                type='submit'
                onClick={() => onSubmit(form.getValues())}
              >
                Apply changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </Form>
    </Dialog>
  );
};
